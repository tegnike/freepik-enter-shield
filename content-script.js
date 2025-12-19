(() => {
  const INIT_FLAG = '__aiGeneratorImeEnterFixInitialized';
  if (window[INIT_FLAG]) {
    return;
  }
  window[INIT_FLAG] = true;

  // Freepik selectors
  const FREEPIK_PROMPT_SELECTOR = '[data-cy="tti-prompt-input"]';
  const FREEPIK_FALLBACK_SELECTOR = '.dynamic-prompt';
  // Higgsfield selectors
  const HIGGSFIELD_PROMPT_SELECTOR = 'form.image-form textarea[name="prompt"]';
  const HIGGSFIELD_FALLBACK_SELECTOR = 'textarea.reference-prompt';

  const PROMPT_SELECTOR = `${FREEPIK_PROMPT_SELECTOR}, ${HIGGSFIELD_PROMPT_SELECTOR}`;
  const PROMPT_FALLBACK_SELECTOR = `${FREEPIK_FALLBACK_SELECTOR}, ${HIGGSFIELD_FALLBACK_SELECTOR}`;
  const GRACE_PERIOD_MS = 80;
  const promptState = new WeakMap();

  /**
   * @param {EventTarget | null} target
   * @returns {HTMLElement | null}
   */
  function resolvePromptElement(target) {
    if (!target) {
      return null;
    }

    if (target instanceof Text) {
      target = target.parentElement;
    }

    if (!(target instanceof HTMLElement)) {
      return null;
    }

    const promptRoot = target.closest(`${PROMPT_SELECTOR}, ${PROMPT_FALLBACK_SELECTOR}`);
    if (!promptRoot) {
      return null;
    }

    if (promptRoot.matches('[contenteditable="true"], textarea, input')) {
      return promptRoot;
    }

    return promptRoot.querySelector('[contenteditable="true"], textarea, input');
  }

  /**
   * @param {HTMLElement} element
   * @returns {{ composing: boolean, lastCompositionEndTs: number }}
   */
  function ensureState(element) {
    let state = promptState.get(element);
    if (!state) {
      state = {
        composing: false,
        lastCompositionEndTs: 0
      };
      promptState.set(element, state);
    }
    return state;
  }

  /**
   * @param {KeyboardEvent} event
   * @param {{ composing: boolean, lastCompositionEndTs: number }} state
   */
  function handleKeyboardEvent(event, state) {
    if (!(event.key === 'Enter' || event.keyCode === 13)) {
      return;
    }

    if (!event.cancelable) {
      return;
    }

    const now = performance.now();
    const isComposingKey =
      event.isComposing ||
      state.composing ||
      event.code === 'Process' ||
      event.keyCode === 229 ||
      (now - state.lastCompositionEndTs) < GRACE_PERIOD_MS;

    if (!isComposingKey) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  document.addEventListener(
    'compositionstart',
    (event) => {
      const promptElement = resolvePromptElement(event.target);
      if (!promptElement) {
        return;
      }
      const state = ensureState(promptElement);
      state.composing = true;
    },
    true
  );

  document.addEventListener(
    'compositionend',
    (event) => {
      const promptElement = resolvePromptElement(event.target);
      if (!promptElement) {
        return;
      }
      const state = ensureState(promptElement);
      state.composing = false;
      state.lastCompositionEndTs = performance.now();
    },
    true
  );

  const keyboardListener = (event) => {
    const promptElement = resolvePromptElement(event.target);
    if (!promptElement) {
      return;
    }
    const state = ensureState(promptElement);
    handleKeyboardEvent(event, state);
  };

  document.addEventListener('keydown', keyboardListener, true);
  document.addEventListener('keyup', keyboardListener, true);
})();
