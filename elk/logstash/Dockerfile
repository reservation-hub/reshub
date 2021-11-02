ARG ELK_VERSION

FROM docker.elastic.co/logstash/logstash:${ELK_VERSION}
ADD https://jdbc.postgresql.org/download/postgresql-42.2.5.jar /usr/share/logstash/vendor/jar/jdbc/postgresql-42.2.5.jar
USER root
RUN chown -R logstash /usr/share/logstash/vendor/
# CMD ["logstash", "-f", "/usr/share/logstash/pipeline/logstash.conf"]