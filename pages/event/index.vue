<template>
  <background>
    <event-abstract-loader v-if="showLoader" />
    <!-- <event-news-loader
      v-if="showLoader"
      v-for="(index) of new Array(3)"
      :key="index"
    /> -->
    <event-abstract v-if="!showLoader" :detail="event" />
    <div 
      v-if="!showLoader"
      v-for="(stack, i) of stackCollection"
      :key="stack.id"
      :id="'i' + stack.id"
      class="stack"
    >
      <event-stack
        class="stack" 
        :stack="stack"
        :order="stackCollection.length - i"
        :id="'stack-' + stack.id"
        :event="event"
        :isLatestStack="i === 0"
      />
    </div>
    <page-foot />
  </background>
</template>

<script>
  import config from '~/const';
  import EventAbstract from '~/components/EventAbstract/EventAbstract.vue';
  import EventAbstractLoader from '~/components/EventAbstract/EventAbstractLoader.vue';
  import EventStack from '~/components/EventStack/EventStack.vue';

  export default {
    data() {
      return {
        showLoader: false,
      };
    },
    computed: {
      name() {
        return this.$route.params.name;
      },
      event() {
        return this.$store.getters.getEvent(this.name);
      },
      stackCollection() {
        return this.$store.getters.getStackCollectionByEvent({
          event: this.name,
        });
      },
      image() {
        return config.static + this.event.headerImage.imageUrl;
      },
    },
    methods: {
      scrollToNews() {
        if (+this.$route.params.stack && document) {
          setTimeout(() => {
            const stack = document.getElementById('stack-' + this.$route.params.stack);
            let news;
            if (this.$route.params.news) {
              news = document.getElementById(`stack-${this.$route.params.stack}-${this.$route.params.news}`);
            }
            if (news) {
              stack.scrollIntoView();
              window.scrollBy(0, -150);
              news.className += ' emphasize';
            } else if (stack) {
              stack.scrollIntoView();
              window.scrollBy(0, -50);
              stack.className += ' emphasize';
            }

            this.$router.replace({
              ...this.$route,
              name: 'event',
            });
          }, 50);
        }
      },
      async init() {
        if (!this.$store.getters.isFirstPage) {
          this.showLoader = true;
          const { name } = this.$route.params;
          await this.$store.dispatch('fetchEvent', {
            name,
            isEventPage: true,
          });
          this.showLoader = false;
        }
        if (!this.$store.getters.isServer) {
          this.scrollToNews();
        }
      },
    },
    async asyncData({ store, params, redirect, route }) {
      if (store.getters.isServer) {
        const event = await store.dispatch('fetchEvent', {
          name: params.name,
          isEventPage: true,
          includes: {
            stack: params.stack,
            news: params.news,
          },
        });
        if (!event) {
          redirect({
            name: 'not-found',
            query: { status: 'event_not_found' },
          });
        }
      }
    },
    mounted() {
      this.init();
    },
    watch: {
      '$route.params.stack'() {
        this.scrollToNews();
      },
    },
    head() {
      let title = this.event.name + ' - 浪潮，你的社会事件追踪工具';
      const image = this.event
        ? (this.event.headerImage ? this.image : null)
        : null;
      let description = this.event
        ? this.event.description
        : null;

      let newsFound = false;
      if (this.$route.params.news) {
        const news = this.$store.getters.getNews({
          id: this.$route.params.news,
        });
        if (news) {
          title = `${news.title} - ${this.event.name}`;
          newsFound = true;
        }
      }
  
      if (this.$route.params.stack) {
        const stack = this.$store.getters.getStack(this.$route.params.stack);
        if (stack) {
          if (!newsFound) {
            title = `${stack.title} - ${this.event.name}`;
          }
          description = stack.description || description;
        }
      }

      return {
        title,
        meta: [
          description ? { hid: 'description', name: 'description', content: description } : {},
          { hid: 't:title', name: 'twitter:title', content: title },
          { hid: 'og:title', property: 'og:title', content: title },
          description ? { hid: 't:description', name: 'twitter:description', content: description } : {},
          description ? { hid: 'og:description', property: 'og:description', content: description } : {},
          image ? { hid: 't:image', name: 'twitter:image', content: image } : {},
          image ? { hid: 'og:image', property: 'og:image', content: image } : {},
        ],
      };
    },
    components: {
      'event-abstract': EventAbstract,
      'event-abstract-loader': EventAbstractLoader,
      'event-stack': EventStack,
    },
  };
</script>

<style lang="scss" scoped>
  .stack {
    width: 100%;
    max-width: 35rem;
  }
</style>
