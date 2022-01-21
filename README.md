# reservation-hub

## 立ち上げ

aliasの設定と環境変数定義

```bash
source aliases.sh
rh-init
```

### 立ち上げ - dev

```bash
rh
```

### Seedを実行したい場合

package.json の`--max-old-space-size=4096`を適切なメモリー値に変えて、seed.tsの`concurrencyRate`を耐えられそうな値に変えて実行してください

```bash
db-reset
```

### DBクライアントの立ち上げ

reshubが立ち上がってるのが大前提

docker ps で確認できる

```bash
db-studio
```

そしてlocalhost:5555を開く

### dbのバックアップを作るコマンド

```bash
rh-db-backup <ファイル名>
```

ファイル名を指定しないと失敗する

### dbのバックアップでrestoreするコマンド

```bash
rh-db-restore <ファイル名>
```

ファイル名を指定しないと失敗する
