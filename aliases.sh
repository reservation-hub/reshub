# init
alias rh-init="git submodule update --init"

# lcl
alias rh-build="docker-compose build server"
alias rh="rh-build && docker-compose up server"
alias rh-logs="docker-compose logs -f --tail 100 server"
alias rh-bash="docker-compose exec server bash"
alias rh-db-bash="docker-compose exec postgresql psql --user root --db reshub --pass"
alias rh-lint-fix="docker-compose exec server node_modules/.bin/eslint . --fix"
alias db-push="docker-compose exec server node_modules/.bin/prisma db push"
alias db-seed="docker-compose exec server npm run seed"
alias db-seed-shop="docker-compose exec server npm run seed-shop"
alias db-reset="time docker-compose exec server npm run db-reset"
alias db-studio="docker-compose exec server node_modules/.bin/prisma studio"
alias rh-test="docker-compose exec server npx ts-node -r tsconfig-paths/register test.ts"

# db back up
function rh-db-backup() {
  if [ -z "$1" ]; then
    echo "バックアップのフォルダー名をお願いします"
    echo "Please enter back up data folder name"
  else
    echo "コンテナを停止します"
    echo "Stopping containers"
    docker stop reshub reshub-db

    echo "バックアップ開始";
    echo "Back up starting..."
    docker run --rm -ti --volumes-from reshub-db -v $(pwd):/backup ubuntu tar cvf /backup/$1.tar /var/lib/postgresql/data

    if [ $? -eq 0 ]; then
      echo "バックアップ完了"
      echo "Back up saved"
      echo $1
    else
      echo "エラーが起きました"
      echo "Error occured"
    fi
  fi
}

# db restore
function rh-db-restore() {
  if [ -z "$1" ]; then
    echo "バックアップのファイルー名をお願いします"
    echo "Please enter back up data file name"
  elif [ ! -e "$1.tar" ]; then
    echo "ファイル名が間違っています"
    echo "Please enter correct file name"
  else
    echo "コンテナを停止します"
    echo "Stopping containers"
    docker stop reshub reshub-db

    echo "修復開始"
    echo "Restoring database..."
    docker run --rm --volumes-from reshub-db -v $(pwd):/backup ubuntu bash -c "cd /var/lib/postgresql && tar xvf /backup/$1.tar --strip 3"

    if [ $? -eq 0 ]; then
      echo "修復完了"
      echo "Restoration complete"
    else
      echo "エラーが起きました"
      echo "Error occured"
    fi
  fi
}

# prd
alias rh-prd="rh-prd-build && docker-compose up production"
alias rh-prd-bash="docker-compose exec production bash"

alias rh-prd-push=" \
    docker tag reshub_prd reshubreshub/reshub_prd:latest && \
    docker push reshubreshub/reshub_prd:latest
"
# deploy
alias rh-prd-deploy="rh-prd-build && rh-prd-push"

function rh-prd-build() {
  git fetch origin main
  ORIGIN_MASTER=$(git show-ref origin/main -s)
  CURRENT=$(git rev-parse HEAD)
  if [[ "$ORIGIN_MASTER" != "$CURRENT" ]]; then
    echo 'origin/main と一致していないのでビルドできません';

    # return error
    return 1
  else
    echo 'git diff をチェックしてビルドします。コミットされてなければビルドできません';
    git diff --exit-code && \
    git diff --staged --exit-code && \
    docker-compose build production
  fi
}
