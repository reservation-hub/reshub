# reservation-hub

## 立ち上げ

aliasの設定と環境変数定義

```bash
source aliases.sh
rh-init
```

### 立ち上げ

```bash
rh
```

### Seedを実行したい場合

```bash
db-seed # shop以外
db-seed-shop # shop 10個
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

### 環境設定

- http://localhost:8090
