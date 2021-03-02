import { PluginInitializerContext, CoreSetup, CoreStart, Plugin } from 'kibana/public';
import { Plugin as ExpressionsPublicPlugin } from '../../../src/plugins/expressions/public';
import { VisualizationsSetup } from '../../../src/plugins/visualizations/public';

import { createTransformVisDefinition } from './transform_vis';
import { createTransformVisFn } from './transform_fn';
import { DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { createGetterSetter } from "../../../src/plugins/kibana_utils/common";
import { ConfigType } from "../common/config";
import { Client } from 'elasticsearch';
import url from 'url';

import './index.scss'

/** @internal */
export interface TransformPluginSetupDependencies {
  expressions: ReturnType<ExpressionsPublicPlugin['setup']>;
  visualizations: VisualizationsSetup;
  data: DataPublicPluginSetup;
}

export const [getInjectedVars, setInjectedVars] = createGetterSetter<{
  allowUnsafe: boolean;
}>('InjectedVars');

/** @internal */
export class TransformPlugin implements Plugin<void, void> {
  initializerContext: PluginInitializerContext<ConfigType>;

  constructor(initializerContext: PluginInitializerContext<ConfigType>) {
    this.initializerContext = initializerContext;
  }

  public async setup(
    core: CoreSetup,
    { expressions, visualizations, data }: TransformPluginSetupDependencies
  ) {
    setInjectedVars({
      allowUnsafe: this.initializerContext.config.get().allowUnsafe,
    });
    const es = new Client({
      host: url.resolve(window.location.href, '../api/transform_vis')
    })
    for (const fun of ['search', 'scroll', 'clearScroll']) {
      // @ts-ignore
      const orig = es[fun];
      // @ts-ignore
      es[fun] = (params, cb) => {
        params.headers = { 'kbn-xsrf': 'transform-vis', ...(params.headers||{}) }
        return orig.call(es, params)
      }
    }

    visualizations.createReactVisualization(
      createTransformVisDefinition({ uiSettings: core.uiSettings, es, data, timeFilter: data.query.timefilter.timefilter })
    );
    expressions.registerFunction(() =>
      createTransformVisFn({ uiSettings: core.uiSettings, es, timeFilter: data.query.timefilter.timefilter })
    );
  }

  public async start(core: CoreStart) {}
}
