import { i18n } from '@kbn/i18n';

import { IUiSettingsClient } from 'kibana/public';

import { getTransformVisWrapper } from './transform_vis_controller';
import { getTransformOptions } from './transform_options';
import { getTransformRequestHandler } from './request_handler';
import { DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { Client } from 'elasticsearch';
import { Timefilter } from "../../../src/plugins/data/public/query";
import { DefaultEditorSize } from "../../../src/plugins/vis_default_editor/public";

export const createTransformVisDefinition = ({
  uiSettings,
  es,
  data,
  timeFilter,
}: {
  uiSettings: IUiSettingsClient;
  es: Client;
  data: DataPublicPluginSetup;
  timeFilter: Timefilter;
}) => {
  const transformRequestHandler = getTransformRequestHandler({ uiSettings, es, timeFilter });
  const transformVisWrapper = getTransformVisWrapper(data);

  return {
    name: 'transform',
    title: 'Transform',
    icon: 'editorCodeBlock',
    description: i18n.translate('visTypeTransform.transformDescription', {
      defaultMessage: 'Transfom query results to custom HTML using template language',
    }),
    visConfig: {
      component: transformVisWrapper,
      defaults: {
        meta: `({
  count_hits: function() {
    return this.response.logstash_query.hits.total;
  }
})`,
        multiquerydsl: `{
  "logstash_query": {
    "index": "logstash-*",
    "query": {
      "bool": {
        "must": [
          "_DASHBOARD_CONTEXT_",
          "_TIME_RANGE_[@timestamp]"
        ]
      }
    }
  }
}`,
        formula: '<hr>{{response.logstash_query.hits.total}} total hits<hr>',
      },
    },
    editorConfig: {
      optionTabs: [
        {
          name: 'dsl',
          title: 'Multi Query DSL',
          editor: getTransformOptions('multiquerydsl'),
        },
        {
          name: 'js',
          title: 'Javascript',
          editor: getTransformOptions('meta'),
        },
        {
          name: 'template',
          title: 'Template',
          editor: getTransformOptions('formula'),
        },
      ],
      enableAutoApply: false,
      defaultSize: DefaultEditorSize.LARGE,
    },
    requestHandler: transformRequestHandler,
    responseHandler: 'none',
    options: {
      showIndexSelection: false,
      showQueryBar: true,
      showFilterBar: true,
    },
  };
};
