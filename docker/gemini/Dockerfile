FROM docker/sandbox-templates:gemini

USER root
COPY shared/install-hoocowork.sh /tmp/install-hoocowork.sh
RUN chmod +x /tmp/install-hoocowork.sh && /tmp/install-hoocowork.sh

USER agent
RUN npm install -g @kolisachint/hoocowork && hoocowork --version

COPY --chown=agent:agent shared/start-hoocowork.sh /home/agent/.hoocowork-start.sh
RUN echo '. ~/.hoocowork-start.sh' >> /home/agent/.bashrc
