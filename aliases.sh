# init
alias reshub-init="git submodule update --init reshub-deploy"

# lcl
alias reshub-lcl-build="docker-compose build"
alias reshub-lcl="reshub-lcl-build && docker-compose up server client"
alias reshub-lcl-server="reshub-lcl-build server && docker-compose up server"
alias reshub-lcl-client="reshub-lcl-build client && docker-compose up client"
alias reshub-lcl-server-logs="docker-compose logs -f --tail 100 server"
alias reshub-lcl-client-logs="docker-compose logs -f --tail 100 client"
alias reshub-lcl-restart="docker-compose restart server client"
alias reshub-lcl-server-bash="docker-compose exec server bash"
alias reshub-lcl-client-bash="docker-compose exec client bash"
alias reshub-lcl-db-bash="docker-compose exec db mongo --username root --authenticationDatabase admin --password root"

# db back up
function reshub-db-backup() {
  if [ -z "$1" ]; then
    echo "バックアップのフォルダー名をお願いします"
    echo "Please enter back up data folder name"
  else
    echo "コンテナを停止します"
    echo "Stopping containers"
    docker stop reshub-server reshub-mongodb

    echo "バックアップ開始";
    echo "Back up starting..."
    docker run --rm -ti --volumes-from reshub-mongodb -v $(pwd):/backup ubuntu tar cvf /backup/$1.tar /data/db

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
function reshub-db-restore() {
  if [ -z "$1" ]; then
    echo "バックアップのファイルー名をお願いします"
    echo "Please enter back up data file name"
  elif [ ! -e "$1.tar" ]; then
    echo "ファイル名が間違っています"
    echo "Please enter correct file name"
  else
    echo "コンテナを停止します"
    echo "Stopping containers"
    docker stop reshub-server reshub-mongodb

    echo "修復開始"
    echo "Restoring database..."
    docker run --rm --volumes-from reshub-mongodb -v $(pwd):/backup mongo:4.2 bash -c "cd /data && tar xvf /backup/$1.tar --strip 1 && mongod --repair"

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
alias reshub-prd="reshub-prd-build && docker-compose up production"
alias reshub-prd-bash="docker-compose exec production bash"

alias reshub-prd-push=" \
    docker tag reshub_prd codejunkie21/reshub_prd:latest && \
    docker push codejunkie21/reshub_prd:latest
"
# deploy
alias reshub-prd-deploy="reshub-prd-build && reshub-prd-push"

function reshub-prd-build() {
  # git fetch origin master
  # ORIGIN_MASTER=$(git show-ref origin/master -s)
  # CURRENT=$(git rev-parse HEAD)
  # if [[ "$ORIGIN_MASTER" != "$CURRENT" ]]; then
  #   echo 'origin/master と一致していないのでビルドできません';

  #   # return error
  #   return 1
  # else
  #   echo 'git diff をチェックしてビルドします。コミットされてなければビルドできません';
  #   git diff --exit-code && \
  #   git diff --staged --exit-code && \
    docker-compose build production
  # fi
}
