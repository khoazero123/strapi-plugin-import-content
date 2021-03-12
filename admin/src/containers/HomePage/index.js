import React, { Component } from 'react';
import Button from 'strapi-helper-plugin/lib/src/components/Button/index';
import IcoContainer from 'strapi-helper-plugin/lib/src/components/IcoContainer/index';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl } from 'react-intl';
import { compose } from 'redux';
import pluginId from '../../pluginId';
import moment from 'moment';

import {
  selectImportConfigs,
  selectImportConfigsError,
  selectImportConfigsLoading
} from './selectors';

import styles from './styles.scss';

import { loadImportConfigs, undoImport, deleteImport } from './actions';
import reducer from './reducer';
import saga from './saga';

export class HomePage extends Component {
  componentDidMount() {
    this.props.loadImportConfigs();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loading && !nextProps.loading) {
      if (
        nextProps.importConfigs &&
        nextProps.importConfigs.some(config => config.ongoing)
      ) {
        setTimeout(() => this.props.loadImportConfigs(), 2000);
      }
    }
  }

  navigateToCreateImport = () => {
    this.props.history.push(`/plugins/${pluginId}/create`);
  };

  deleteImport = id => () => {
    this.props.deleteImport(id);
  };

  undoImport = id => () => {
    this.props.undoImport(id);
  };

  getSourceText = item => {
    switch (item.source) {
      case 'upload':
        return item.options.filename;
      case 'url':
        return item.options.url;
    }
  };

  render() {
    const { importConfigs } = this.props;

    return (
      <div className={styles.homePage}>
        <Button
          label="Create a new Import"
          onClick={this.navigateToCreateImport}
          secondaryHotlineAdd
        />

        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Content Type</th>
              <th>Updated</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {importConfigs &&
              importConfigs.map(item => {
                const updatedAt = moment(item.updated_at);

                return (
                  <tr className={item.ongoing ? styles.inProgress : null}>
                    <td>{this.getSourceText(item)}</td>
                    <td>{item.contentType}</td>
                    <td>{updatedAt.fromNow()}</td>
                    <td>{item.importedCount}</td>
                    <td>
                      <IcoContainer
                        icons={[
                          ...[
                            item.ongoing
                              ? { icoType: 'spinner' }
                              : {
                                icoType: 'undo',
                                onClick: this.undoImport(item.id)
                              }
                          ],
                          {
                            icoType: 'trash',
                            onClick: this.deleteImport(item.id)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}

HomePage.contextTypes = {
  router: PropTypes.object
};

HomePage.propTypes = {
  history: PropTypes.object.isRequired,
  loadImports: PropTypes.func.isRequired,
  importConfigs: PropTypes.array,
  undoImport: PropTypes.func.isRequired,
  deleteImport: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  loadImportConfigs,
  undoImport,
  deleteImport
};

const mapStateToProps = createStructuredSelector({
  importConfigs: selectImportConfigs(),
  loading: selectImportConfigsLoading(),
  error: selectImportConfigsError()
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

const withReducer = strapi.injectReducer({
  key: 'homePage',
  reducer,
  pluginId
});
const withSaga = strapi.injectSaga({ key: 'homePage', saga, pluginId });

export default compose(
  withReducer,
  withSaga,
  withConnect
)(injectIntl(HomePage));
