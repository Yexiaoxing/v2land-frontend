import $ from 'postman-url-encoder';

export default {
  async getEvent({ dispatch, state, getters }, name) {
    if (typeof name === 'undefined') {
      throw new TypeError('name should not be undefined');
    }

    const event = getters.getEvent(name);
    if (event) return event;

    return dispatch('fetchEvent', { name });
  },

  async fetchEvent({ commit, getters }, { name, isEventPage }) {
    if (typeof name === 'undefined') {
      throw new TypeError('name should not be undefined');
    }
    const url = $.encode(`event/${name}`);
    try {
      if (isEventPage) {
        commit('setFetchingStatus', {
          name: 'getEvent',
          status: 'loading',
        });
      }
      const { data } = await this.$axios.get(url, { progress: false });
      commit('setEvent', { event: data });
      if (isEventPage) {
        commit('setFetchingStatus', {
          name: 'getEvent',
          status: 'loaded',
        });
      }
      return data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        this.app.$message.error('该事件不存在或未被公开');
      } else {
        console.error(err);
      }
      return null;
    }
  },

  async fetchEventList({ commit, state }, { where, page } = {}) {
    let eventList = [];
    const url = $.encode('event/list');

    if (!where) where = { status: 'admitted' };
    if (!page) page = 1;

    try {
      commit('setFetchingStatus', {
        name: 'eventList',
        status: 'loading',
        page,
      });
      const { data } = await this.$axios.post(url, { where, page });
      for (const event of data.eventList) {
        commit('setEvent', { event: event });
      }
      eventList = data.eventList;
      commit('setFetchingStatus', {
        name: 'eventList',
        status: 'loaded',
      });
    } catch (err) {
      // FIXME: toast
      console.error(err);
    }

    return eventList;
  },

  async fetchStackList({ commit }, { where = { status: 'admitted' } }) {
    let stackList = [];

    try {
      const { data } = await this.$axios.post('stack/list', { where });
      for (const stack of data.stackList) {
        commit('setStack', { stack });
      }
      stackList = data.stackList;
    } catch (err) {
      console.error(err);
    }

    return stackList;
  },

  async getNewsList({ commit, dispatch }, { where, page }) {
    try {
      const { data } = await this.$axios.post('news', { where, page });
      for (const news of (data.newsList || data)) {
        commit('setNews', news);
      }
      return data.newsList || data;
    } catch (err) {
      return [];
    }
  },

  async getPendingNews({ commit }, name) {
    if (name) {
      const url = $.encode(`event/${name}/pending`);
      const { data } = await this.$axios.get(url);

      for (const news of data.newsCollection) {
        commit('setNews', { news });
      }

      return data.newsCollection;
    } else {
      const url = $.encode(`news/pending`);
      const { data } = await this.$axios.get(url);

      for (const news of data.newsCollection) {
        commit('setNews', { news });
      }

      return data.newsCollection;
    }
  },

  async editEvent({ dispatch }, { name, data }) {
    const url = $.encode(`event/${name}`);
    return this.$axios.put(url, data);
  },

  async createEvent({ dispatch, getters }, { data }) {
    const url = $.encode('event/');
    return this.$axios.post(url, data);
  },

  async getNews({ state, commit, getters }, id) {
    if (!id) return;
    const found = getters.getNews({ id });
    if (found && found.contribution && found.contribution[0] &&
      found.contribution[0].data) {
      return found;
    }

    const url = $.encode('news/' + id);
    const { data } = await this.$axios.get(url);
    if (!data) return false;
    commit('setNews', { news: data.news });
    return data.news;
  },

  async editNews({ dispatch }, { id, data }) {
    const url = $.encode(`news/${id}`);
    return this.$axios.put(url, data);
  },

  async getClient({ commit }, id = 'me') {
    const url = $.encode('client/' + id);
    try {
      const { data } = await this.$axios.get(url);
      commit('setClient', { client: data.client, id });
      if (id === 'me') {
        this.app.$ga.set('userId', data.client.id);
      }
      return data.client;
    } catch (err) {
      return null;
    }
  },

  async getClientList({ commit }, where) {
    try {
      const { data } = await this.$axios.post('client', { where });
      commit('setClientList', data.clientList);
      return data.clientList;
    } catch (err) {
      throw err;
    }
  },

  async getSubscriptions({ commit, dispatch }) {
    const url = $.encode('client/me');
    const { data } = await this.$axios.get(url);
    commit('setSubscriptionList', data.client.subscriptions);
    return data.client.subscriptionList;
  },

  async logout({ commit }) {
    await this.$axios.get('client/logout');
    this.app.$ga.set('userId', null);
    commit('setClient', {});
  },

  async getAvailableAuthMethod({ state, commit, getters }) {
    if (state.availableAuths.length > 0 && !getters.isServer) {
      return state.availableAuths;
    } else {
      const { data } = await this.$axios.get('auth/options');
      state.availableAuths = ['fetched'];

      for (const property in data) {
        if (data[property] === true) {
          state.availableAuths.push(property);
        }
      }

      return state.availableAuths;
    }
  },
};
