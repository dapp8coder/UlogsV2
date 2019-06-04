import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import { Carousel, Collapse } from 'antd';
import YoutubePlayer from 'react-player/lib/players/YouTube';
import { getFeedContent } from './feedActions';
import { getIsLoaded, getIsAuthenticated } from '../reducers';
import SubFeed from './SubFeed';
import HeroBannerContainer from './HeroBannerContainer';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import TopicSelector from '../components/TopicSelector';
import TrendingTagsMenu from '../components/TrendingTagsMenu';
import Affix from '../components/Utils/Affix';
import ScrollToTop from '../components/Utils/ScrollToTop';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import QuickPostEditor from '../components/QuickPostEditor/QuickPostEditor';
import MainMenu from '../components/MainMenu';
import UlogsBanner from '../components/UlogsBanner';
import './Feed.less';

@connect(state => ({
  authenticated: getIsAuthenticated(state),
  loaded: getIsLoaded(state),
}))
class Page extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    history: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
  };

  static fetchData({ store, match }) {
    const { sortBy, category } = match.params;
    return store.dispatch(getFeedContent({ sortBy, category, limit: 10 }));
  }

  handleSortChange = key => {
    const { category } = this.props.match.params;
    if (category) {
      this.props.history.push(`/${key}/${category}`);
    } else {
      this.props.history.push(`/${key}`);
    }
  };

  handleTopicClose = () => this.props.history.push('/trending');

  render() {
    const { authenticated, loaded, location, match } = this.props;
    const { category, sortBy } = match.params;

    const shouldDisplaySelector = location.pathname !== '/' || (!authenticated && loaded);
    const displayTopicSelector = location.pathname === '/trending';
    const robots = location.pathname === '/' ? 'index,follow' : 'noindex,follow';
    const displayUlogCaption =
      category &&
      category.match(
        /^(ulog-quotes|ulog-howto|ulog-diy|ulog-surpassinggoogle|teardrops|untalented|ulog-ned|ulography|ulog-gratefulvibes|ulog-resolutions|ulog-memes|ulog-blocktrades|ulog-showerthoughts|ulog-snookmademedoit|ulog-utopian|ulog-thejohalfiles|ulogifs|ulog-surfyogi|ulog-bobbylee|ulog-stellabelle|ulog-sweetsssj|ulog-dimimp|ulog-teamsteem|ulog-kusknee|ulog-papapepper|ulog-steemjet)$/,
      );
    const isStartsWithUlog = category && category.startsWith('ulog-');

    const convertUlogTag = `Thank you for beginning the process of creating a Ulog-Community. To further the process, start by contributing ulogs under this very ulog-subtag and inviting others to do the same. You can start now! Simply visit this editor on 'https://ulogs.org/main-editor' to contribute a ulog and make sure to use the ulog-subtag here as one of the tags underneath your post.&nbsp;  
      To complete the process of creating a Ulog-Community, kindly send an email containing your intention to [uloggers@gmail.com](mailto:uloggers@gmail.com) &nbsp;  
      Note: Anyone can choose to complete the process!`

    return (
      <div>
        <Helmet>
          <title>Ulogs</title>
          <meta name="robots" content={robots} />
        </Helmet>
        <ScrollToTop />

        <ScrollToTopOnMount />
        {(authenticated && !displayUlogCaption && !isStartsWithUlog) ? (
          <Carousel autoplay className="feed-carousel">
            <div>
              <a href="ulog/@uloggers/uloggers-today-s-certified-and-verified-ulogger-true-celebrity-is-jejes-join-in-as-her-true-fans-we-will-fix-many-worries">
                <img width={'100%'} height={'100%'} alt="900x500" src="/images/slide1.jpg" />
              </a>
            </div>
            <YoutubePlayer
              className="youtube-player"
              url="https://youtu.be/5tq_rCZURUg"
              width="100%"
              controls
            />
            <div>
              <a href="ulog/@uloggers/uloggers-today-s-certified-and-verified-ulogger-true-celebrity-is-enjieneer-join-in-as-her-true-fans-we-will-fix-many-worries">
                <img width={'100%'} height={'100%'} alt="900x500" src="/images/slide2.jpg" />
              </a>
            </div>
            <YoutubePlayer
              className="youtube-player"
              url="https://youtu.be/pKoW5HJ1l84"
              width="100%"
              controls
            />
            <YoutubePlayer
              className="youtube-player"
              url="https://youtu.be/K8G97hEls_U"
              width="100%"
              controls
            />
            <div>
              <a href="ulog/@uloggers/uloggers-today-s-certified-and-verified-ulogger-true-celebrity-is-kneelyrac-join-in-as-her-true-fans-we-will-fix-many-worries">
                <img width={'100%'} height={'100%'} alt="900x500" src="/images/slide3.jpg" />
              </a>
            </div>
            <YoutubePlayer
              className="youtube-player"
              url="https://youtu.be/kKZ1CixLG2s"
              width="100%"
              controls
            />
            <YoutubePlayer
              className="youtube-player"
              url="https://youtu.be/UqNsKU4lnLo"
              width="100%"
              controls
            />
            <div>
              <a href="ulog/@uloggers/uloggers-today-s-certified-and-verified-ulogger-true-celebrity-is-sn0white-join-in-as-her-true-fans-we-will-fix-many-worries">
                <img width={'100%'} height={'100%'} alt="900x500" src="/images/slide4.jpg" />
              </a>
            </div>
            <YoutubePlayer
              className="youtube-player"
              url="https://youtu.be/MAPKUato1K8"
              width="100%"
              controls
            />
          </Carousel>
        ) : (
          <HeroBannerContainer />
        )}
        {(authenticated && displayUlogCaption) && <UlogsBanner category={category} />}
        {(authenticated && !displayUlogCaption && isStartsWithUlog) && <UlogsBanner category={category} />}
        <MainMenu />
        <div className="shifted">
          <div className="feed-layout container">
            <Affix className="leftContainer" stickPosition={77}>
              <div className="left">
                <LeftSidebar />
              </div>
            </Affix>
            <Affix className="rightContainer" stickPosition={77}>
              <div className="right">
                <RightSidebar />
              </div>
            </Affix>
            <div className="center">
              {(!displayUlogCaption && isStartsWithUlog) && 
                <Collapse defaultActiveKey={['1']}>
                  <Collapse.Panel header={'Convert #' + category + ' To A Ulog-Community'} key="1">
                    <p>
                      <ReactMarkdown source={convertUlogTag} />
                    </p>
                  </Collapse.Panel>
                </Collapse>
              }
              {displayTopicSelector && <TrendingTagsMenu />}
              {shouldDisplaySelector && (
                <TopicSelector
                  isSingle={false}
                  sort={sortBy}
                  topics={category ? [category] : []}
                  onSortChange={this.handleSortChange}
                  onTopicClose={this.handleTopicClose}
                />
              )}
              {authenticated && <QuickPostEditor />}
              <SubFeed />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Page;
