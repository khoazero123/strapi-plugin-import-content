import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import Button from 'strapi-helper-plugin/lib/src/components/Button';
import Label from 'strapi-helper-plugin/lib/src/components/Label';
import InputSpacer from 'strapi-helper-plugin/lib/src/components/InputSpacer';

function readFileContent(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export class UploadFileForm extends Component {
  state = {
    source: 'url',
    file: null,
    type: null,
    options: {
      filename: null
    }
  };

  onChangeImportFile = event => {
    const file = event.target.files[0];

    this.setState({
      file,
      type: file.type,
      options: {
        ...this.state.options,
        filename: file.name
      }
    });
  };

  clickAnalyzeUploadFile = async () => {
    const { file, options } = this.state;

    const data = await readFileContent(file);

    this.props.onRequestAnalysis({
      source: 'upload',
      type: file.type,
      options,
      data
    });
  };

  onChangeOption = option => event => {
    this.setState({
      options: { ...this.state.options, [option]: event.target.value }
    });
  };

  render() {
    const { loadingAnalysis } = this.props;

    return (
      <table>
        <tr>
          <td>
            <input
              type="file"
              accept=".csv"
              onChange={this.onChangeImportFile}
            />
          </td>
          <td>
            <Button
              label={'Analyze'}
              onClick={this.clickAnalyzeUploadFile}
              secondaryHotline
              loading={loadingAnalysis}
            />
          </td>
        </tr>
      </table>
    );
  }
}

UploadFileForm.propTypes = {
  onRequestAnalysis: PropTypes.func.isRequired,
  loadingAnalysis: PropTypes.bool.isRequired
};

export default injectIntl(UploadFileForm);
