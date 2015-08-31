'use strict';

let { Set } = require('immutable');
let React = require('react-native');
let {
  PropTypes,
  StyleSheet,
  View,
} = React;

let Badge = require('./Badge');
let StaticContainer = require('./StaticContainer');
let Tab = require('./Tab');
let TabBar = require('./TabBar');

class TabNavigator extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      renderedSceneKeys: this._updateRenderedSceneKeys(props.children),
    };
  }

  componentWillReceiveProps(nextProps) {
    let { renderedSceneKeys } = this.state;
    this.setState({
      renderedSceneKeys: this._updateRenderedSceneKeys(
        nextProps.children,
        renderedSceneKeys,
      ),
    });
  }

  _getSceneKey(item, index): string {
    return `scene-${(item.key !== null) ? item.key : index}`;
  }

  _updateRenderedSceneKeys(children, oldSceneKeys = Set()): Set {
    let newSceneKeys = Set().asMutable();
    React.Children.forEach(children, (item, index) => {
      let key = this._getSceneKey(item, index);
      if (oldSceneKeys.has(key) || item.props.selected) {
        newSceneKeys.add(key);
      }
    });
    return newSceneKeys.asImmutable();
  }

  render() {
    let { style, children, ...props } = this.props;
    let scenes = [];

    React.Children.forEach(children, (item, index) => {
      let sceneKey = this._getSceneKey(item, index);
      if (!this.state.renderedSceneKeys.has(sceneKey)) {
        return;
      }

      let { selected } = item.props;
      let scene =
        <SceneContainer key={sceneKey} selected={selected}>
          {item}
        </SceneContainer>;
      if (selected) {
        scenes.push(scene);
      } else {
        scenes.unshift(scene);
      }
    });

    return (
      <View {...props} style={[styles.container, style]}>
        {scenes}
        <TabBar>
          {React.Children.map(children, this._renderTab)}
        </TabBar>
      </View>
    );
  }

  _renderTab(item) {
    let icon;
    if (item.props.selected) {
      if (item.props.renderSelectedIcon) {
        icon = item.props.renderSelectedIcon();
      } else if (item.props.renderIcon) {
        let defaultIcon = item.props.renderIcon();
        icon = React.cloneElement(defaultIcon, {
          style: [defaultIcon.props.style, styles.defaultSelectedIcon],
        });
      }
    } else if (item.props.renderIcon) {
      icon = item.props.renderIcon();
    }

    let badge;
    if (item.props.renderBadge) {
      badge = item.props.renderBadge();
    } else if (item.props.badgeText) {
      badge = <Badge>{item.props.badgeText}</Badge>;
    }

    return (
      <Tab
        title={item.props.title}
        titleStyle={[
          item.props.titleStyle,
          item.props.selected ? styles.defaultSelectedTitle : null,
        ]}
        badge={badge}
        onPress={item.props.onPress}>
        {icon}
      </Tab>
    );
  }
}

class SceneContainer extends React.Component {
  static propTypes = {
    selected: PropTypes.bool,
  };

  render() {
    let { selected, ...props } = this.props;
    return (
      <View
        {...props}
        pointerEvents={selected ? 'auto' : 'none'}
        removeClippedSubviews={!selected}
        style={[
          styles.sceneContainer,
          selected ? null : styles.hiddenSceneContainer,
        ]}>
        <StaticContainer shouldUpdate={selected}>
          {this.props.children}
        </StaticContainer>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sceneContainer: {
    flex: 1,
  },
  hiddenSceneContainer: {
    height: 0,
    overflow: 'hidden',
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  defaultSelectedTitle: {
    color: 'rgb(0, 122, 255)',
  },
  defaultSelectedIcon: {
    tintColor: 'rgb(0, 122, 255)',
  },
});

TabNavigator.Item = require('./TabNavigatorItem');

module.exports = TabNavigator;