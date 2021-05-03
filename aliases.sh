# init
alias reshub-init="git submodule update --init reshub-deploy \
                  && cp reshub-deploy/.env* ./ \
                  && echo '.envを作成してください'
"

# lcl
alias reshub-lcl-build="docker-compose build server client"
alias reshub-lcl="reshub-lcl-build && docker-compose up server client"
alias reshub-lcl-server="reshub-lcl-build && docker-compose up server"
alias reshub-lcl-client="reshub-lcl-build && docker-compose up client"
alias reshub-lcl-server-logs="docker-compose logs -f --tail 100 server"
alias reshub-lcl-client-logs="docker-compose logs -f --tail 100 client"
alias reshub-lcl-restart="docker-compose restart server client"
alias reshub-lcl-server-bash="docker-compose exec server bash"
alias reshub-lcl-client-bash="docker-compose exec client bash"

# prd
alias reshub-prd="reshub-prd-build && docker-compose up -d prd"
alias reshub-prd-bash="docker-compose exec prd bash"

alias reshub-prd-push=" \
    docker tag reshub_prd codejunkie21/reshub_prd:latest && \
    docker push codejunkie21/reshub_prd:latest
"
# deploy
alias reshub-prd-deploy="reshub-prd-build && reshub-prd-push"

function reshub-prd-build() {
  git fetch origin master
  ORIGIN_MASTER=$(git show-ref origin/master -s)
  CURRENT=$(git rev-parse HEAD)
  if [[ "$ORIGIN_MASTER" != "$CURRENT" ]]; then
    echo 'origin/master と一致していないのでビルドできません';

    # return error
    return 1
  else
    echo 'git diff をチェックしてビルドします。コミットされてなければビルドできません';
    git diff --exit-code && \
    git diff --staged --exit-code && \
    docker-compose build php-fpm prd
  fi
}
