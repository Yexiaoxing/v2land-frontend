<template>
  <div v-if="news" :id="`stack-${news.stack}-${news.id}`">
    <div
      class="news-item"
      ref="container">
      <div class="info" ref="info">
        <div class="source-icon">
          <img class="source-icon" v-lazy="'/defaultSource.png'" />
        </div>
        <a class="title" @click="reportNewsClick()" :href="url" target="_blank">{{ news.title }}</a>
        <div class="shadow" ref="shadow" />
      </div>
      <div class="source" ref="source">
        <span>{{ news.source }}</span>
        <el-popover
          placement="bottom"
          width="275"
          v-model="showMore">
          <div class="more-container">
            <span class="button-history" @click="contribDialogVisible = true">
              编辑记录
            </span>
            <div class="divider" />
            <event-news-share
              class="news-share"
              :object="news"
              type="stack-news"
            />
          </div>
          <i class="el-icon-more button-more" slot="reference" />
        </el-popover>
        <i class="el-icon-edit" @click="editNews()" v-if="showEdit" />
      </div>
    </div>
    <el-dialog
      title="新闻编辑记录"
      :visible.sync="contribDialogVisible"
      :append-to-body="true"
    >
      <event-news-contribution :news="news" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="contribDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
  <div
    class="news-item"
    ref="container"
    v-else
  >
    <div class="info">未找到相关新闻</div>
  </div>
</template>

<script>
import EventNewsContent from '~/components/EventNews/EventNewsContent.vue';
import EventNewsContribution from '~/components/EventNews/EventNewsContribution.vue';
import EventNewsShare from '~/components/EventShare.vue';

export default {
  name: 'EventStackNews',
  props: {
    'news': Object,
    'mode': String,
  },
  data() {
    return {
      showMore: false,
      contribDialogVisible: false,
      lastWidth: null,
    };
  },
  computed: {
    url() {
      if (!this.news.url) return;
      return '/redirect?to=' + encodeURIComponent(this.news.url);
    },
    showEdit() {
      return this.mode === 'edit';
    },
  },
  methods: {
    reportNewsClick() {
      window.__ENDERMAN_REPORTER__.report({
        type: 'Business',
        action: 'StackNewsClick',
        meta: {
          url: this.url,
        },
      });
    },
    scale() {
      const containerEl = this.$refs.container;
      if (!containerEl) return;
      if (!this.lastWidth) {
        this.lastWidth = containerEl.offsetWidth;
      } else if (Math.abs(containerEl.offsetWidth - this.lastWidth) < 5) {
        return;
      }
      const sourceEl = this.$refs.source;
      const infoEl = this.$refs.info;
      const shadowEl = this.$refs.shadow;
      const width = sourceEl.offsetWidth;
      const showShadow = infoEl.offsetWidth >= containerEl.offsetWidth - 16 - width ? 1 : 0;
      shadowEl.setAttribute('style', `display: block; opacity: ${showShadow}; right: ${width}px`);
      infoEl.setAttribute('style', `max-width:calc(100% - ${width}px)`);
    },
    toggleMore() {
      this.showMore = !this.showMore;
      if (!this.showDetail) this.scale();
    },
    editNews() {
      this.$store.commit('setTemp', {
        label: 'newsToEdit',
        temp: {
          ...this.news,
        },
      });
      this.$emit('edit');
    },
  },
  mounted() {
    if (this.news) {
      window.addEventListener('resize', this.scale);
      this.scale();
    }
  },
  components: {
    'event-news-content': EventNewsContent,
    'event-news-contribution': EventNewsContribution,
    'event-news-share': EventNewsShare,
  },
};
</script>

<style lang="scss" scoped>
  .news-item {
    display: flex;
    padding: .1rem 0;
    margin: 0 2rem;
    border-radius: .25rem;
    font-size: 14px;
    position: relative;
    user-select: none !important;
  }

  .info {
    overflow: hidden;
    white-space: nowrap;
    max-width: calc(100% - 4rem);
    display: flex;
    align-items: center;
  }

  .info *:not(img) {
    line-height: 1.75;
    border-top: 1.5px solid transparent;
    border-bottom: 1.5px solid transparent;
  }

  .source-icon {
    width: 16px;
    height: 16px;
    margin-right: .25rem;
    border: 0px !important;
    line-height: 0 !important;
  }

  .source-icon img {
    border-radius: 1px;
    margin-right: 0;
  }

  .title {
    font-weight: bold;
    margin-right: .25rem;
    color: #333;
  }

  .title:hover {
    text-decoration: none !important;
    border-bottom-color: #333;
  }

  .source {
    position: absolute;
    right: .5rem;
    line-height: 1.8;
    top: 0;
    display: flex;
    align-items: center;
  }

  .source > * {
    margin-left: .3rem;
  }

  .shadow {
    content: "";
    display: none;
    text-align: right;
    position: absolute;
    bottom: 0;
    width: 4rem;
    height: 100%;
    transition: opacity .2s;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 90%);
  }

  .button-more {
    transform: rotate(90deg);
    cursor: pointer;
  }

  .el-icon-edit {
    cursor: pointer;
  }

  .more-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .button-history {
    cursor: pointer;
    margin-left: .25rem;
  }

  .more-container .divider {
    width: 1px;
    height: 1rem;
    color: #ccc;
    margin: 0 0 0 .35rem;
  }

  @media (max-width: 600px) {
    .news-item {
      margin: 0;
    }
  }
</style>
