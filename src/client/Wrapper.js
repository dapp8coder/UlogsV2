import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { message, Alert, LocaleProvider, Layout } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import Cookie from 'js-cookie';
import { findLanguage, getRequestLocale, getBrowserLocale, loadLanguage } from './translations';
import {
  getIsLoaded,
  getAuthenticatedUser,
  getAuthenticatedUserName,
  getLocale,
  getUsedLocale,
  getTranslations,
  getUseBeta,
  getUloggersFollowingList,
  getIsFetchingUloggersFollowingList,
  getNightmode,
} from './reducers';
import { login, logout, busyLogin } from './auth/authActions';
import {
  getFollowing,
  getUloggersFollowing,
  getNotifications,
} from './user/userActions';
import {
  getRate,
  getRewardFund,
  getTrendingTopics,
  setUsedLocale,
  setAppUrl,
} from './app/appActions';
import * as reblogActions from './app/Reblog/reblogActions';
import Redirect from './components/Utils/Redirect';
import NotificationPopup from './notifications/NotificationPopup';
import Topnav from './components/Navigation/Topnav';
import Transfer from './wallet/Transfer';
import PowerUpOrDown from './wallet/PowerUpOrDown';
import BBackTop from './components/BBackTop';
import * as announcement from './announcements/announcement'
import AnnouncementBanner from './components/AnnouncementBanner'

@withRouter
@connect(
  state => ({
    loaded: getIsLoaded(state),
    user: getAuthenticatedUser(state),
    username: getAuthenticatedUserName(state),
    usedLocale: getUsedLocale(state),
    translations: getTranslations(state),
    locale: getLocale(state),
    uloggersFollowingList: getUloggersFollowingList(state),
    isFetchingUloggersFollowingList: getIsFetchingUloggersFollowingList(state),
    nightmode: getNightmode(state),
  }),
  {
    login,
    logout,
    getFollowing,
    getUloggersFollowing,
    getNotifications,
    getRate,
    getRewardFund,
    getTrendingTopics,
    busyLogin,
    getRebloggedList: reblogActions.getRebloggedList,
    setUsedLocale,
  },
)
export default class Wrapper extends React.PureComponent {
  static propTypes = {
    route: PropTypes.shape().isRequired,
    user: PropTypes.shape().isRequired,
    locale: PropTypes.string.isRequired,
    history: PropTypes.shape().isRequired,
    usedLocale: PropTypes.string,
    translations: PropTypes.shape(),
    username: PropTypes.string,
    login: PropTypes.func,
    logout: PropTypes.func,
    getFollowing: PropTypes.func,
    getUloggersFollowing: PropTypes.func,
    getRewardFund: PropTypes.func,
    getRebloggedList: PropTypes.func,
    getRate: PropTypes.func,
    getTrendingTopics: PropTypes.func,
    getNotifications: PropTypes.func,
    setUsedLocale: PropTypes.func,
    busyLogin: PropTypes.func,
    nightmode: PropTypes.bool,
  };

  static defaultProps = {
    usedLocale: null,
    translations: {},
    username: '',
    login: () => {},
    logout: () => {},
    getFollowing: () => {},
    getUloggersFollowing: () => {},
    getRewardFund: () => {},
    getRebloggedList: () => {},
    getRate: () => {},
    getTrendingTopics: () => {},
    getNotifications: () => {},
    setUsedLocale: () => {},
    busyLogin: () => {},
    nightmode: false,
  };

  static async fetchData({ store, req, res }) {
    await store.dispatch(login());

    const appUrl = url.format({
      protocol: req.protocol,
      host: req.get('host'),
    });

    store.dispatch(setAppUrl(appUrl));

    const state = store.getState();

    const useBeta = getUseBeta(state);

    if (useBeta && appUrl === 'https://ulogs.org') {
      res.redirect(`https://staging.ulogs.org${req.originalUrl}`);
      return;
    }

    let activeLocale = getLocale(state);
    if (activeLocale === 'auto') {
      activeLocale = req.cookies.language || getRequestLocale(req.get('Accept-Language'));
    }

    const lang = await loadLanguage(activeLocale);

    store.dispatch(setUsedLocale(lang));
  }

  constructor(props) {
    super(props);

    this.loadLocale = this.loadLocale.bind(this);
    this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
  }

  componentDidMount() {
    this.props.login().then(() => {
      this.props.getFollowing();
      this.props.getUloggersFollowing();
      this.props.getNotifications();
      this.props.busyLogin();
    });

    this.props.getRewardFund();
    this.props.getRebloggedList();
    this.props.getRate();
    this.props.getTrendingTopics();
  }

  componentWillReceiveProps(nextProps) {
    const { locale } = this.props;

    if (locale !== nextProps.locale) {
      this.loadLocale(nextProps.locale);
    }
  }

  componentDidUpdate() {
    if (this.props.nightmode) {
      document.body.classList.add('nightmode');
    } else {
      document.body.classList.remove('nightmode');
    }
  }

  async loadLocale(locale) {
    let activeLocale = locale;
    if (activeLocale === 'auto') {
      activeLocale = Cookie.get('language') || getBrowserLocale();
    }

    const lang = await loadLanguage(activeLocale);

    this.props.setUsedLocale(lang);
  }

  /*
   * Display a coming soon message when user clicks on any "Click Here" button
   */
  messageComingSoon = () => {
    message.success('Coming soon!', 3);
  }

  handleMenuItemClick(key) {
    switch (key) {
      case 'logout':
        this.props.logout();
        break;
      case 'activity':
        this.props.history.push('/activity');
        break;
      case 'replies':
        this.props.history.push('/replies');
        break;
      case 'bookmarks':
        this.props.history.push('/bookmarks');
        break;
      case 'drafts':
        this.props.history.push('/drafts');
        break;
      case 'settings':
        this.props.history.push('/settings');
        break;
      case 'feed':
        this.props.history.push('/');
        break;
      case 'grow':
        this.props.history.push('/grow');
        break;
      case 'create-community':
        this.props.history.push('/create-community');
        break;
      case 'news':
        this.props.history.push('/trending');
        break;
      case 'wallet':
        this.props.history.push('/wallet');
        break;
      case 'my-profile':
        this.props.history.push(`/@${this.props.username}`);
        break;
      case 'ulog-witnesses':
        this.props.history.push('/vote-ulog-witnesses');
        break;
      case 'about-ulogs':
        this.props.history.push('/@ulogs/ulogs-org-faq-s-and-answers');
        break;
      case 'ulog-subtags':
        this.props.history.push('/ulog-subtags');
        break;
      case 'custom-profile':
      case 'ulog-faucet':
      case 'get-certified':
      case 'merchandise':
      case 'exchange':
      case 'teardrop-smt':
        this.messageComingSoon();
        break;
      default:
        break;
    }
  }

  render() {
    const { user, usedLocale, translations } = this.props;

    const language = findLanguage(usedLocale);

    // check if any of of the announcement message is set
    const displayBanner = announcement.message1 || announcement.message2

    // if both announcement messages are set, display a two-liner banner
    const displayTwoLiner = (announcement.message1 && announcement.message2) !== ""

    return (
      <IntlProvider key={language.id} locale={language.localeData} messages={translations}>
        <LocaleProvider locale={enUS}>
          <Layout data-dir={language && language.rtl ? 'rtl' : 'ltr'}>
            <Layout.Header style={{ position: 'fixed', width: '100%', zIndex: 1050 }}>
              {displayBanner && (
                <AnnouncementBanner displayTwoLiner={displayTwoLiner} />
              )}
              <Topnav username={user.name} onMenuItemClick={this.handleMenuItemClick} />
            </Layout.Header>
            <div className="content">
              {renderRoutes(this.props.route.routes)}
              <Redirect />
              <Transfer />
              <PowerUpOrDown />
              <NotificationPopup />
              <BBackTop className="primary-modal" />
            </div>
          </Layout>
        </LocaleProvider>
      </IntlProvider>
    );
  }
}
