# freepik-enter-shield

Freepik の AI 画像生成ツール（ https://jp.freepik.com/pikaso/ai-image-generator ）で、日本語 IME の変換確定時に `Enter` キーが誤って送信トリガーとして扱われる問題を回避する Chrome 拡張機能です。

## 主な機能
- `compositionstart` / `compositionend` を監視し、IME 変換中や変換直後の `Enter` キーイベントをキャンセルして誤送信を防止。
- 変換確定後に短い猶予時間（既定 80ms）を設け、確定直後の `Enter` も安全に無効化。
- 通常入力時の `Enter` は従来どおり送信として扱われます。

## フォルダ構成
| ファイル | 説明 |
| --- | --- |
| `manifest.json` | MV3 マニフェスト。対象 URL とコンテンツスクリプトを登録。 |
| `content-script.js` | IME 変換状態を検知し、不要な `Enter` イベントを遮断するスクリプト。 |

## 導入手順
1. Chrome で `chrome://extensions/` を開き、右上の「デベロッパーモード」をオンにします。
2. 「パッケージ化されていない拡張機能を読み込む」をクリックし、このフォルダ（`freepik-enter-shield`）を選択します。
3. `https://jp.freepik.com/pikaso/ai-image-generator` を開き直し、拡張が自動的に有効になることを確認します。

## 動作確認のポイント
1. 日本語 IME を使用して入力フォームにテキストを入力。
2. 漢字変換を行い、`Enter` で確定しても送信が発生しないことを確認。
3. 変換確定後にもう一度 `Enter` を押し、生成操作が意図どおり実行されることを確認。

## カスタマイズ
- 変換確定後の猶予時間を変更する場合は、`content-script.js` 内の `GRACE_PERIOD_MS` を編集してください。
- 対象 URL が追加・変更された際は、`manifest.json` の `matches` 配列に該当パターンを追記してください。

## 補足
- この拡張機能はローカル利用を前提としており、Chrome ウェブストアへの公開は想定していません。
- 新しい UI やクラス名への対応が必要になった場合は、`content-script.js` のセレクタを調整してください。
