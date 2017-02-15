(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

module.exports = {
  /**
   * Determine if a component is a layout component or not.
   *
   * @param {Object} component
   *   The component to check.
   *
   * @returns {Boolean}
   *   Whether or not the component is a layout component.
   */
  isLayoutComponent: function isLayoutComponent(component) {
    return (
      (component.columns && Array.isArray(component.columns)) ||
      (component.rows && Array.isArray(component.rows)) ||
      (component.components && Array.isArray(component.components))
    ) ? true : false;
  },

  /**
   * Iterate through each component within a form.
   *
   * @param {Object} components
   *   The components to iterate.
   * @param {Function} fn
   *   The iteration function to invoke for each component.
   * @param {Boolean} includeAll
   *   Whether or not to include layout components.
   * @param {String} path
   *   The current data path of the element. Example: data.user.firstName
   */
  eachComponent: function eachComponent(components, fn, includeAll, path) {
    if (!components) return;
    path = path || '';
    components.forEach(function(component) {
      var hasColumns = component.columns && Array.isArray(component.columns);
      var hasRows = component.rows && Array.isArray(component.rows);
      var hasComps = component.components && Array.isArray(component.components);
      var noRecurse = false;
      var newPath = component.key ? (path ? (path + '.' + component.key) : component.key) : '';

      if (includeAll || component.tree || (!hasColumns && !hasRows && !hasComps)) {
        noRecurse = fn(component, newPath);
      }

      var subPath = function() {
        if (component.key && ((component.type === 'datagrid') || (component.type === 'container'))) {
          return newPath;
        }
        return path;
      };

      if (!noRecurse) {
        if (hasColumns) {
          component.columns.forEach(function(column) {
            eachComponent(column.components, fn, includeAll, subPath());
          });
        }

        else if (hasRows) {
          [].concat.apply([], component.rows).forEach(function(row) {
            eachComponent(row.components, fn, includeAll, subPath());
          });
        }

        else if (hasComps) {
          eachComponent(component.components, fn, includeAll, subPath());
        }
      }
    });
  },

  /**
   * Get a component by its key
   *
   * @param {Object} components
   *   The components to iterate.
   * @param {String} key
   *   The key of the component to get.
   *
   * @returns {Object}
   *   The component that matches the given key, or undefined if not found.
   */
  getComponent: function getComponent(components, key) {
    var result;
    module.exports.eachComponent(components, function(component) {
      if (component.key === key) {
        result = component;
      }
    });
    return result;
  },

  /**
   * Flatten the form components for data manipulation.
   *
   * @param {Object} components
   *   The components to iterate.
   * @param {Boolean} includeAll
   *   Whether or not to include layout components.
   *
   * @returns {Object}
   *   The flattened components map.
   */
  flattenComponents: function flattenComponents(components, includeAll) {
    var flattened = {};
    module.exports.eachComponent(components, function(component, path) {
      flattened[path] = component;
    }, includeAll);
    return flattened;
  },

  /**
   * Get the value for a component key, in the given submission.
   *
   * @param {Object} submission
   *   A submission object to search.
   * @param {String} key
   *   A for components API key to search for.
   */
  getValue: function getValue(submission, key) {
    var data = submission.data || {};

    var search = function search(data) {
      var i;
      var value;

      if (!data) {
        return null;
      }

      if (data instanceof Array) {
        for (i = 0; i < data.length; i++) {
          if (typeof data[i] === 'object') {
            value = search(data[i]);
          }

          if (value) {
            return value;
          }
        }
      }
      else if (typeof data === 'object') {
        if (data.hasOwnProperty(key)) {
          return data[key];
        }

        var keys = Object.keys(data);
        for (i = 0; i < keys.length; i++) {
          if (typeof data[keys[i]] === 'object') {
            value = search(data[keys[i]]);
          }

          if (value) {
            return value;
          }
        }
      }
    };

    return search(data);
  }
};

},{}],2:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('address', {
        icon: 'fa fa-home',
        views: [
          {
            name: 'Display',
            template: 'formio/components/address/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/address/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#address'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/address/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<div class="form-group">' +
            '<label for="mapRegion" form-builder-tooltip="The region bias to use for this search. See <a href=\'https://developers.google.com/maps/documentation/geocoding/intro#RegionCodes\' target=\'_blank\'>Region Biasing</a> for more information.">Region Bias</label>' +
            '<input type="text" class="form-control" id="mapRegion" name="mapRegion" ng-model="component.map.region" placeholder="Dallas" />' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="mapKey" form-builder-tooltip="The API key for Google Maps. See <a href=\'https://developers.google.com/maps/documentation/geocoding/get-api-key\' target=\'_blank\'>Get an API Key</a> for more information.">Google Maps API Key</label>' +
            '<input type="text" class="form-control" id="mapKey" name="mapKey" ng-model="component.map.key" placeholder="xxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxx"/>' +
          '</div>' +
          '<form-builder-option property="multiple" label="Allow Multiple Addresses"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/address/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option property="unique"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],3:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    'FORM_OPTIONS',
    function(
      formioComponentsProvider,
      FORM_OPTIONS
    ) {
      formioComponentsProvider.register('button', {
        onEdit: ['$scope', function($scope) {
          $scope.actions = FORM_OPTIONS.actions;
          $scope.sizes = FORM_OPTIONS.sizes;
          $scope.themes = FORM_OPTIONS.themes;
        }],
        icon: 'fa fa-stop',
        views: [
          {
            name: 'Display',
            template: 'formio/components/button/display.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#button'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/button/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<div class="form-group">' +
            '<label for="action" form-builder-tooltip="This is the action to be performed by this button.">Action</label>' +
            '<select class="form-control" id="action" name="action" ng-options="action.name as action.title for action in actions" ng-model="component.action"></select>' +
          '</div>' +
          '<div class="form-group" ng-if="component.action === \'event\'">' +
          '  <label for="event" form-builder-tooltip="The event to fire when the button is clicked.">Button Event</label>' +
          '  <input type="text" class="form-control" id="event" name="event" ng-model="component.event" placeholder="event" />' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="theme" form-builder-tooltip="The color theme of this panel.">Theme</label>' +
            '<select class="form-control" id="theme" name="theme" ng-options="theme.name as theme.title for theme in themes" ng-model="component.theme"></select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="size" form-builder-tooltip="The size of this button.">Size</label>' +
            '<select class="form-control" id="size" name="size" ng-options="size.name as size.title for size in sizes" ng-model="component.size"></select>' +
          '</div>' +
          '<form-builder-option property="leftIcon"></form-builder-option>' +
          '<form-builder-option property="rightIcon"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="block"></form-builder-option>' +
          '<form-builder-option property="disableOnInvalid"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],4:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('checkbox', {
        icon: 'fa fa-check-square',
        views: [
          {
            name: 'Display',
            template: 'formio/components/checkbox/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/checkbox/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#checkbox'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/checkbox/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="datagridLabel"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/checkbox/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],5:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('columns', {
        fbtemplate: 'formio/formbuilder/columns.html',
        icon: 'fa fa-columns',
        documentation: 'http://help.form.io/userguide/#columns',
        noDndOverlay: true,
        confirmRemove: true,
        views: [
          {
            name: 'Display',
            template: 'formio/components/columns/display.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ]
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/columns.html',
        '<div class="row">' +
          '<div class="col-xs-6 component-form-group" ng-repeat="component in component.columns">' +
            '<form-builder-list class="formio-column" component="component" form="form" formio="::formio"></form-builder-list>' +
          '</div>' +
        '</div>'
      );
      $templateCache.put('formio/components/columns/display.html',
        '<ng-form>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],6:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the component markup.
      $templateCache.put('formio/components/settings.html',
        '<form id="component-settings" novalidate>' +
          '<div class="row">' +
            '<div class="col-md-6">' +
              '<p class="lead" ng-if="::formComponent.title" style="margin-top:10px;">{{::formComponent.title}} Component</p>' +
            '</div>' +
            '<div class="col-md-6">' +
              '<div class="pull-right" ng-if="::formComponent.documentation" style="margin-top:10px; margin-right:20px;">' +
                '<a ng-href="{{ ::formComponent.documentation }}" target="_blank"><i class="glyphicon glyphicon-new-window"></i> Help!</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="col-xs-6">' +
              '<uib-tabset>' +
                '<uib-tab ng-repeat="view in ::formComponent.views" heading="{{ ::view.name }}"><ng-include src="::view.template"></ng-include></uib-tab>' +
              '</uib-tabset>' +
            '</div>' +
            '<div class="col-xs-6">' +
              '<div class="panel panel-default preview-panel" style="margin-top:44px;">' +
                '<div class="panel-heading">Preview</div>' +
                '<div class="panel-body">' +
                  '<formio-component component="component" data="{}" formio="::formio"></formio-component>' +
                '</div>' +
              '</div>' +
              '<formio-settings-info component="component" data="{}" formio="::formio"></formio-settings-info>' +
              '<div class="form-group">' +
                '<button type="submit" class="btn btn-success" ng-click="closeThisDialog(true)">Save</button>&nbsp;' +
                '<button type="button" class="btn btn-default" ng-click="closeThisDialog(false)" ng-if="!component.isNew">Cancel</button>&nbsp;' +
                '<button type="button" class="btn btn-danger" ng-click="removeComponent(component, formComponents[component.type].confirmRemove); closeThisDialog(false)">Remove</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</form>'
      );

      // Create the common API tab markup.
      $templateCache.put('formio/components/common/data.html',
        '<form-builder-option property="defaultValue"></form-builder-option>' +
        '<uib-accordion>' +
        '  <div uib-accordion-group heading="Custom Default Value" class="panel panel-default">' +
        '    <textarea class="form-control" rows="5" id="customDefaultValue" name="customDefaultValue" ng-model="component.customDefaultValue" placeholder="/*** Example Code ***/\nvalue = data[\'mykey\'] + data[\'anotherKey\'];"></textarea>' +
        '    <small>' +
        '      <p>Enter custom default value code.</p>' +
        '      <p>You must assign the <strong>value</strong> variable as the result you want for the default value.</p>' +
        '      <p>The global variable <strong>data</strong> is provided, and allows you to access the data of any form component, by using its API key.</p>' +
        '      <p>Default Values are only calculated on form load. Use Calculated Value for a value that will update with the form.</p>' +
        '    </small>' +
        '  </div>' +
        '  <div uib-accordion-group heading="Calculated Value" class="panel panel-default">' +
        '    <textarea class="form-control" rows="5" id="calculateValue" name="calculateValue" ng-model="component.calculateValue" placeholder="/*** Example Code ***/\nvalue = data[\'mykey\'] + data[\'anotherKey\'];"></textarea>' +
        '    <small>' +
        '      <p>Enter code to calculate a value.</p>' +
        '      <p>You must assign the <strong>value</strong> variable as the result you want for the default value.</p>' +
        '      <p>The global variable <strong>data</strong> is provided, and allows you to access the data of any form component, by using its API key.</p>' +
        '    </small>' +
        '  </div>' +
        '</uib-accordion>'
      );

      // Create the common API tab markup.
      $templateCache.put('formio/components/common/api.html',
        '<ng-form>' +
          '<form-builder-option-key></form-builder-option-key>' +
          '<form-builder-option-tags></form-builder-option-tags>' +
        '</ng-form>'
      );

      // Create the common Layout tab markup.
      $templateCache.put('formio/components/common/layout.html',
        '<ng-form>' +
          // Need to use array notation to have dash in name
          '<form-builder-option property="style[\'margin-top\']"></form-builder-option>' +
          '<form-builder-option property="style[\'margin-right\']"></form-builder-option>' +
          '<form-builder-option property="style[\'margin-bottom\']"></form-builder-option>' +
          '<form-builder-option property="style[\'margin-left\']"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the common Layout tab markup.
      $templateCache.put('formio/components/common/conditional.html',
        '<form-builder-conditional></form-builder-conditional>'
      );
    }
  ]);
};

},{}],7:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('container', {
        fbtemplate: 'formio/formbuilder/container.html',
        views: [
          {
            name: 'Display',
            template: 'formio/components/container/display.html'
          }, {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#container',
        noDndOverlay: true,
        confirmRemove: true
      });
    }
  ]);

  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/components/container/display.html',
        '<ng-form>' +
        '<form-builder-option property="label"></form-builder-option>' +
        '<form-builder-option property="customClass"></form-builder-option>' +
        '<form-builder-option property="protected"></form-builder-option>' +
        '<form-builder-option property="persistent"></form-builder-option>' +
        '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/formbuilder/container.html',
        '<fieldset>' +
        '<label ng-if="component.label" class="control-label">{{ component.label }}</label>' +
        '<form-builder-list component="component" form="form" formio="::formio"></form-builder-list>' +
        '</fieldset>'
      );
    }
  ]);
};

},{}],8:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('content', {
        fbtemplate: 'formio/formbuilder/content.html',
        icon: 'fa fa-html5',
        documentation: 'http://help.form.io/userguide/#content-component',
        controller: function(settings, $scope) {
          $scope.$watch('component.html', function() {
            $scope.$emit('formBuilder:update');
          });
        },
        views: [
          {
            name: 'Display',
            template: 'formio/components/common/display.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ]
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/content.html',
        '<div class="form-group">' +
          '<textarea ckeditor ng-model="component.html"><textarea>' +
        '</div>'
      );
      $templateCache.put('formio/components/common/display.html',
        '<ng-form>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],9:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('currency', {
        icon: 'fa fa-usd',
        views: [
          {
            name: 'Display',
            template: 'formio/components/currency/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/currency/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#currency'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/currency/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="description"></form-builder-option>' +
          '<form-builder-option property="prefix"></form-builder-option>' +
          '<form-builder-option property="suffix"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="multiple"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the API markup.
      $templateCache.put('formio/components/currency/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],10:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('custom', {
        icon: 'fa fa-cubes',
        views: [
          {
            name: 'Display',
            template: 'formio/components/custom/display.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#custom'
      });
    }
  ]);

  app.controller('customComponent', [
    '$scope',
    'formioComponents',
    function(
      $scope,
      formioComponents
    ) {
      // Because of the weirdnesses of prototype inheritence, components can't update themselves, only their properties.
      $scope.$watch('component', function(newValue, oldValue) {
        if (newValue) {
          // Don't allow a type of a real type.
          newValue.type = (formioComponents.components.hasOwnProperty(newValue.type) ? 'custom' : newValue.type);
          // Ensure some key settings are set.
          newValue.key = newValue.key || newValue.type;
          newValue.protected = (newValue.hasOwnProperty('protected') ? newValue.protected : false);
          newValue.persistent = (newValue.hasOwnProperty('persistent') ? newValue.persistent : true);
          $scope.updateComponent(newValue, oldValue);
        }
      });
    }
  ]);

  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/custom/display.html',
        '<ng-form>' +
        '<div class="form-group">' +
        '<p>Custom components can be used to render special fields or widgets inside your app. For information on how to display in an app, see <a href="http://help.form.io/userguide/#custom" target="_blank">custom component documentation</a>.</p>' +
        '<label for="json" form-builder-tooltip="Enter the JSON for this custom element.">Custom Element JSON</label>' +
        '<textarea ng-controller="customComponent" class="form-control" id="json" name="json" json-input ng-model="component" placeholder="{}" rows="10"></textarea>' +
        '</div>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],11:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('datagrid', {
        fbtemplate: 'formio/formbuilder/datagrid.html',
        icon: 'fa fa-th',
        views: [
          {
            name: 'Display',
            template: 'formio/components/datagrid/display.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#datagrid',
        noDndOverlay: true,
        confirmRemove: true
      });
    }
  ]);

  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/components/datagrid/display.html',
        '<ng-form>' +
        '<form-builder-option property="label"></form-builder-option>' +
        '<form-builder-option property="addAnother"></form-builder-option>' +
        '<form-builder-option property="customClass"></form-builder-option>' +
        '<form-builder-option property="striped"></form-builder-option>' +
        '<form-builder-option property="bordered"></form-builder-option>' +
        '<form-builder-option property="hover"></form-builder-option>' +
        '<form-builder-option property="condensed"></form-builder-option>' +
        '<form-builder-option property="protected"></form-builder-option>' +
        '<form-builder-option property="persistent"></form-builder-option>' +
        '<form-builder-option property="disabled"></form-builder-option>' +
        '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],12:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('datetime', {
        onEdit: ['$scope', function($scope) {
          // FOR-34 - Update 12hr time display in the field, not only time picker.
          $scope.$watch('component.timePicker.showMeridian', function(value) {
            var _old = value ? 'HH' : 'hh';
            var _new = !value ? 'HH' : 'hh';

            if ($scope.component.enableTime) {
              $scope.component.format = $scope.component.format.toString().replace(_old, _new);
            }
          });

          $scope.setFormat = function() {
            if ($scope.component.enableDate && $scope.component.enableTime) {
              $scope.component.format = 'yyyy-MM-dd HH:mm';
            }
            else if ($scope.component.enableDate && !$scope.component.enableTime) {
              $scope.component.format = 'yyyy-MM-dd';
            }
            else if (!$scope.component.enableDate && $scope.component.enableTime) {
              $scope.component.format = 'HH:mm';
            }
          };
          $scope.startingDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          $scope.modes = [
            {
              name: 'day',
              label: 'Day'
            },
            {
              name: 'month',
              label: 'Month'
            },
            {
              name: 'year',
              label: 'Year'
            }
          ];
        }],
        icon: 'fa fa-clock-o',
        views: [
          {
            name: 'Display',
            template: 'formio/components/datetime/display.html'
          },
          {
            name: 'Date',
            template: 'formio/components/datetime/date.html'
          },
          {
            name: 'Time',
            template: 'formio/components/datetime/time.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/datetime/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#datetime'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/datetime/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="defaultDate"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="description"></form-builder-option>' +
          '<form-builder-option property="format" label="Date Format" placeholder="Enter the Date format" title="The format for displaying this field\'s date. The format must be specified like the <a href=\'https://docs.angularjs.org/api/ng/filter/date\' target=\'_blank\'>AngularJS date filter</a>."></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/datetime/date.html',
        '<ng-form>' +
          '<div class="checkbox">' +
            '<label form-builder-tooltip="Enables date input for this field.">' +
              '<input type="checkbox" id="enableDate" name="enableDate" ng-model="component.enableDate" ng-checked="component.enableDate" ng-change="setFormat()"> Enable Date Input' +
            '</label>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="datepickerMode" form-builder-tooltip="The initial view to display when clicking on this field.">Initial Mode</label>' +
            '<select class="form-control" id="datepickerMode" name="datepickerMode" ng-model="component.datepickerMode" ng-options="mode.name as mode.label for mode in modes"></select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="placeholder" form-builder-tooltip="The minimum date that can be picked.">Minimum Date</label>' +
            '<div class="input-group">' +
              '<input type="text" class="form-control" ' +
                'ng-focus="minDateOpen = true" ' +
                'ng-init="minDateOpen = false" ' +
                'is-open="minDateOpen" ' +
                'datetime-picker="yyyy-MM-dd" ' +
                'enable-time="false" ' +
                'ng-model="component.minDate" />' +
              '<span class="input-group-btn">' +
                '<button type="button" class="btn btn-default" ng-click="minDateOpen = true"><i class="fa fa-calendar"></i></button>' +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="placeholder"  form-builder-tooltip="The maximum date that can be picked.">Maximum Date</label>' +
            '<div class="input-group">' +
              '<input type="text" class="form-control" ' +
                'ng-focus="maxDateOpen = true" ' +
                'ng-init="maxDateOpen = false" ' +
                'is-open="maxDateOpen" ' +
                'datetime-picker="yyyy-MM-dd" ' +
                'enable-time="false" ' +
                'ng-model="component.maxDate" />' +
              '<span class="input-group-btn">' +
                '<button type="button" class="btn btn-default" ng-click="maxDateOpen = true"><i class="fa fa-calendar"></i></button>' +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="startingDay" form-builder-tooltip="The first day of the week.">Starting Day</label>' +
            '<select class="form-control" id="startingDay" name="startingDay" ng-model="component.datePicker.startingDay" ng-options="idx as day for (idx, day) in startingDays"></select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="minMode" form-builder-tooltip="The smallest unit of time view to display in the date picker.">Minimum Mode</label>' +
            '<select class="form-control" id="minMode" name="minMode" ng-model="component.datePicker.minMode" ng-options="mode.name as mode.label for mode in modes"></select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="maxMode" form-builder-tooltip="The largest unit of time view to display in the date picker.">Maximum Mode</label>' +
            '<select class="form-control" id="maxMode" name="maxMode" ng-model="component.datePicker.maxMode" ng-options="mode.name as mode.label for mode in modes"></select>' +
          '</div>' +
          '<form-builder-option property="datePicker.yearRange" label="Number of Years Displayed" placeholder="Year Range" title="The number of years to display in the years view."></form-builder-option>' +

          '<form-builder-option property="datePicker.showWeeks" type="checkbox" label="Show Week Numbers" title="Displays the week numbers on the date picker."></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/datetime/time.html',
        '<ng-form>' +
          '<div class="checkbox">' +
            '<label form-builder-tooltip="Enables time input for this field.">' +
              '<input type="checkbox" id="enableTime" name="enableTime" ng-model="component.enableTime" ng-checked="component.enableTime" ng-change="setFormat()"> Enable Time Input' +
            '</label>' +
          '</div>' +
          '<form-builder-option property="timePicker.hourStep" type="number" label="Hour Step Size" title="The number of hours to increment/decrement in the time picker."></form-builder-option>' +
          '<form-builder-option property="timePicker.minuteStep" type="number" label="Minute Step Size" title="The number of minutes to increment/decrement in the time picker."></form-builder-option>' +
          '<form-builder-option property="timePicker.showMeridian" type="checkbox" label="12 Hour Time (AM/PM)" title="Display time in 12 hour time with AM/PM."></form-builder-option>' +
          '<form-builder-option property="timePicker.readonlyInput" type="checkbox" label="Read-Only Input" title="Makes the time picker input boxes read-only. The time can only be changed by the increment/decrement buttons."></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/datetime/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],13:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('day', {
        icon: 'fa fa-calendar',
        views: [
          {
            name: 'Display',
            template: 'formio/components/day/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/day/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#day'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/day/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="fields.day.placeholder" label="Day Placeholder"></form-builder-option>' +
          '<form-builder-option property="fields.month.placeholder" label="Month Placeholder"></form-builder-option>' +
          '<form-builder-option property="fields.year.placeholder" label="Year Placeholder"></form-builder-option>' +
          '<form-builder-option property="dayFirst" type="checkbox" label="Day first" title="Display the Day field before the Month field."></form-builder-option>' +
          '<form-builder-option property="fields.day.hide" type="checkbox" label="Hide Day" title="Hide the day part of the component."></form-builder-option>' +
          '<form-builder-option property="fields.month.hide" type="checkbox" label="Hide Month" title="Hide the month part of the component."></form-builder-option>' +
          '<form-builder-option property="fields.year.hide" type="checkbox" label="Hide Year" title="Hide the year part of the component."></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/day/validate.html',
        '<ng-form>' +
          '<form-builder-option property="fields.day.required" label="Require Day" type="checkbox"></form-builder-option>' +
          '<form-builder-option property="fields.month.required" label="Require Month" type="checkbox"></form-builder-option>' +
          '<form-builder-option property="fields.year.required" label="Require Year" type="checkbox"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],14:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      var views = _.cloneDeep(formioComponentsProvider.$get().components.textfield.views);
      _.each(views, function(view) {
        if (view.name === 'Validation') {
          view.template = 'formio/components/email/validate.html';
        }
      });
      formioComponentsProvider.register('email', {
        icon: 'fa fa-at',
        views: views,
        documentation: 'http://help.form.io/userguide/#email'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/components/email/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option property="unique"></form-builder-option>' +
          '<div class="panel panel-default">' +
            '<div class="panel-heading"><h3 class="panel-title">Kickbox</h3></div>' +
            '<div class="panel-body">' +
              '<p>Validate this email using the Kickbox email validation service.</p>' +
              '<div class="checkbox">' +
                '<label for="kickbox-enable" form-builder-tooltip="Enable Kickbox validation for this email field.">' +
                  '<input type="checkbox" id="kickbox-enable" name="kickbox-enable" ng-model="component.kickbox.enabled"> Enable' +
                '</label>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<form-builder-option property="validate.minLength"></form-builder-option>' +
          '<form-builder-option property="validate.maxLength"></form-builder-option>' +
          '<form-builder-option property="validate.pattern"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],15:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('fieldset', {
        fbtemplate: 'formio/formbuilder/fieldset.html',
        icon: 'fa fa-th-large',
        views: [
          {
            name: 'Display',
            template: 'formio/components/fieldset/display.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#fieldset',
        keepChildrenOnRemove: true,
        noDndOverlay: true,
        confirmRemove: true
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/fieldset.html',
        '<fieldset>' +
          '<legend ng-if="component.legend">{{ component.legend }}</legend>' +
          '<form-builder-list component="component" form="form" formio="::formio"></form-builder-list>' +
        '</fieldset>'
      );

      // Create the settings markup.
      $templateCache.put('formio/components/fieldset/display.html',
        '<ng-form>' +
          '<form-builder-option property="legend" label="Legend" placeholder="FieldSet Legend" title="The legend text to appear above this fieldset."></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],16:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(
      formioComponentsProvider
    ) {
      formioComponentsProvider.register('file', {
        onEdit: [
          '$scope',
          'Formio',
          function($scope, Formio) {
            // Pull out title and name from the list of storage plugins.
            $scope.storage = _.map(Formio.providers.storage, function(storage, key) {
              return {
                title: storage.title,
                name: key
              };
            });
          }
        ],
        icon: 'fa fa-file',
        views: [
          {
            name: 'Display',
            template: 'formio/components/file/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/file/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#file'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/file/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<div class="form-group">' +
            '<label for="storage" form-builder-tooltip="Which storage to save the files in.">Storage</label>' +
            '<select class="form-control" id="storage" name="storage" ng-options="store.name as store.title for store in storage" ng-model="component.storage"></select>' +
          '</div>' +
          '<form-builder-option property="url" ng-show="component.storage === \'url\'"></form-builder-option>' +
          '<form-builder-option property="dir"></form-builder-option>' +
          '<form-builder-option property="image"></form-builder-option>' +
          '<form-builder-option property="imageSize" ng-if="component.image"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="multiple"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/file/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option property="filePattern"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],17:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('hidden', {
        fbtemplate: 'formio/formbuilder/hidden.html',
        icon: 'fa fa-user-secret',
        views: [
          {
            name: 'Display',
            template: 'formio/components/hidden/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/hidden/validation.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#hidden'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/hidden.html', '<span class="hidden-element-text">{{ component.label }}</span>');

      // Create the settings markup.
      $templateCache.put('formio/components/hidden/display.html',
        '<ng-form>' +
          '<form-builder-option property="label" label="Name" placeholder="Enter the name for this hidden field" title="The name for this field. It is only used for administrative purposes such as generating the automatic property name in the API tab (which may be changed manually)."></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/hidden/validation.html',
        '<ng-form>' +
          '<form-builder-option property="unique"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],18:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('htmlelement', {
        fbtemplate: 'formio/formbuilder/htmlelement.html',
        icon: 'fa fa-code',
        views: [
          {
            name: 'Display',
            template: 'formio/components/htmlelement/display.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#html-element-component'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/htmlelement.html',
        '<formio-html-element component="component"></div>'
      );

      // Create the settings markup.
      $templateCache.put('formio/components/htmlelement/display.html',
        '<ng-form>' +
        '<form-builder-option property="customClass" label="Container Custom Class"></form-builder-option>' +
          '<form-builder-option property="tag" label="HTML Tag" placeholder="HTML Element Tag" title="The tag of this HTML element."></form-builder-option>' +
          '<form-builder-option property="className" label="CSS Class" placeholder="CSS Class" title="The CSS class for this HTML element."></form-builder-option>' +
          '<value-builder ' +
            'data="component.attrs" ' +
            'label="Attributes" ' +
            'tooltip-text="The attributes for this HTML element. Only safe attributes are allowed, such as src, href, and title." ' +
            'value-property="value" ' +
            'label-property="attr" ' +
            'value-label="Value" ' +
            'label-label="Attribute" ' +
            'no-autocomplete-value="true" ' +
          '></value-builder>' +
          '<div class="form-group">' +
            '<label for="content" form-builder-tooltip="The content of this HTML element.">Content</label>' +
            '<textarea class="form-control" id="content" name="content" ng-model="component.content" placeholder="HTML Content" rows="3">{{ component.content }}</textarea>' +
          '</div>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],19:[function(_dereq_,module,exports){
"use strict";
var app = angular.module('ngFormBuilder');

// Basic
_dereq_('./components')(app);
_dereq_('./textfield')(app);
_dereq_('./number')(app);
_dereq_('./password')(app);
_dereq_('./textarea')(app);
_dereq_('./checkbox')(app);
_dereq_('./selectboxes')(app);
_dereq_('./select')(app);
_dereq_('./radio')(app);
_dereq_('./htmlelement')(app);
_dereq_('./content')(app);
_dereq_('./button')(app);

// Special
_dereq_('./email')(app);
_dereq_('./phonenumber')(app);
_dereq_('./address')(app);
_dereq_('./datetime')(app);
_dereq_('./day')(app);
_dereq_('./currency')(app);
_dereq_('./hidden')(app);
_dereq_('./resource')(app);
_dereq_('./file')(app);
_dereq_('./signature')(app);
_dereq_('./custom')(app);
_dereq_('./datagrid')(app);
_dereq_('./survey')(app);

// Layout
_dereq_('./columns')(app);
_dereq_('./fieldset')(app);
_dereq_('./container')(app);
_dereq_('./page')(app);
_dereq_('./panel')(app);
_dereq_('./table')(app);
_dereq_('./well')(app);

},{"./address":2,"./button":3,"./checkbox":4,"./columns":5,"./components":6,"./container":7,"./content":8,"./currency":9,"./custom":10,"./datagrid":11,"./datetime":12,"./day":13,"./email":14,"./fieldset":15,"./file":16,"./hidden":17,"./htmlelement":18,"./number":20,"./page":21,"./panel":22,"./password":23,"./phonenumber":24,"./radio":25,"./resource":26,"./select":27,"./selectboxes":28,"./signature":29,"./survey":30,"./table":31,"./textarea":32,"./textfield":33,"./well":34}],20:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('number', {
        icon: 'fa fa-hashtag',
        views: [
          {
            name: 'Display',
            template: 'formio/components/number/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/number/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#number'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/number/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="description"></form-builder-option>' +
          '<form-builder-option property="validate.step" label="Increment (Step)" placeholder="Enter how much to increment per step (or precision)." title="The amount to increment/decrement for each step."></form-builder-option>' +
          '<form-builder-option property="prefix"></form-builder-option>' +
          '<form-builder-option property="suffix"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="multiple"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the API markup.
      $templateCache.put('formio/components/number/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option property="validate.min" type="number" label="Minimum Value" placeholder="Minimum Value" title="The minimum value this field must have before the form can be submitted."></form-builder-option>' +
          '<form-builder-option property="validate.max" type="number" label="Maximum Value" placeholder="Maximum Value" title="The maximum value this field must have before the form can be submitted."></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],21:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('page', {
        fbtemplate: 'formio/formbuilder/page.html'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/page.html',
        '<form-builder-list component="component" form="form" formio="::formio"></form-builder-list>'
      );
    }
  ]);
};

},{}],22:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    'FORM_OPTIONS',
    function(
      formioComponentsProvider,
      FORM_OPTIONS
    ) {
      formioComponentsProvider.register('panel', {
        fbtemplate: 'formio/formbuilder/panel.html',
        icon: 'fa fa-list-alt',
        onEdit: ['$scope', function($scope) {
          $scope.themes = FORM_OPTIONS.themes;
        }],
        views: [
          {
            name: 'Display',
            template: 'formio/components/panel/display.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#panels',
        noDndOverlay: true,
        confirmRemove: true
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/panel.html',
        '<div class="panel panel-{{ component.theme }}">' +
          '<div ng-if="component.title" class="panel-heading"><h3 class="panel-title">{{ component.title }}</h3></div>' +
          '<div class="panel-body">' +
            '<form-builder-list component="component" form="form" formio="::formio"></form-builder-list>' +
          '</div>' +
        '</div>'
      );

      // Create the settings markup.
      $templateCache.put('formio/components/panel/display.html',
        '<ng-form>' +
          '<form-builder-option property="title" label="Title" placeholder="Panel Title" title="The title text that appears in the header of this panel."></form-builder-option>' +
          '<div class="form-group">' +
            '<label for="theme" form-builder-tooltip="The color theme of this panel.">Theme</label>' +
            '<select class="form-control" id="theme" name="theme" ng-options="theme.name as theme.title for theme in themes" ng-model="component.theme"></select>' +
          '</div>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],23:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('password', {
        icon: 'fa fa-asterisk',
        views: [
          {
            name: 'Display',
            template: 'formio/components/password/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/textfield/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#password',
        template: 'formio/components/password.html'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function(
      $templateCache
    ) {
      // Disable dragging on password inputs because it breaks dndLists
      var textFieldTmpl = $templateCache.get('formio/components/textfield.html');
      var passwordTmpl = textFieldTmpl.replace(
        /<input type="{{ component.inputType }}" /g,
        '<input type="{{ component.inputType }}" dnd-nodrag '
      );
      $templateCache.put('formio/components/password.html', passwordTmpl);

      // Create the settings markup.
      $templateCache.put('formio/components/password/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="description"></form-builder-option>' +
          '<form-builder-option property="prefix"></form-builder-option>' +
          '<form-builder-option property="suffix"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],24:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('phoneNumber', {
        icon: 'fa fa-phone-square',
        views: [
          {
            name: 'Display',
            template: 'formio/components/phoneNumber/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/phoneNumber/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#phonenumber'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/phoneNumber/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="description"></form-builder-option>' +
          '<form-builder-option property="inputMask"></form-builder-option>' +
          '<form-builder-option property="prefix"></form-builder-option>' +
          '<form-builder-option property="suffix"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="multiple"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the Validation markup.
      $templateCache.put('formio/components/phoneNumber/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option property="unique"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],25:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('radio', {
        icon: 'fa fa-dot-circle-o',
        views: [
          {
            name: 'Display',
            template: 'formio/components/radio/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/radio/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#radio'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/radio/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<value-builder data="component.values" default="component.defaultValue" label="Values" tooltip-text="The radio button values that can be picked for this field. Values are text submitted with the form data. Labels are text that appears next to the radio buttons on the form."></value-builder>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="inline" type="checkbox" label="Inline Layout" title="Displays the radio buttons horizontally."></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );
      // Create the API markup.
      $templateCache.put('formio/components/radio/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],26:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('resource', {
        onEdit: ['$scope', function($scope) {
          $scope.resources = [];
          $scope.component.project = $scope.formio.projectId;
          $scope.formio.loadForms({params: {type: 'resource', limit: 100}}).then(function(resources) {
            $scope.resources = resources;
            if (!$scope.component.resource) {
              $scope.component.resource = resources[0]._id;
            }
          });
        }],
        icon: 'fa fa-files-o',
        views: [
          {
            name: 'Display',
            template: 'formio/components/resource/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/resource/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#resource'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/resource/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<div class="form-group">' +
            '<label for="placeholder" form-builder-tooltip="The resource to be used with this field.">Resource</label>' +
            '<select class="form-control" id="resource" name="resource" ng-options="value._id as value.title for value in resources" ng-model="component.resource"></select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="placeholder" form-builder-tooltip="The properties on the resource to return as part of the options. Separate property names by commas. If left blank, all properties will be returned.">Select Fields</label>' +
            '<input type="text" class="form-control" id="selectFields" name="selectFields" ng-model="component.selectFields" placeholder="Comma separated list of fields to select." value="{{ component.selectFields }}">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="placeholder" form-builder-tooltip="A list of search filters based on the fields of the resource. See the <a target=\'_blank\' href=\'https://github.com/travist/resourcejs#filtering-the-results\'>Resource.js documentation</a> for the format of these filters.">Search Fields</label>' +
            '<input type="text" class="form-control" id="searchFields" name="searchFields" ng-model="component.searchFields" ng-list placeholder="The fields to query on the server" value="{{ component.searchFields }}">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="placeholder" form-builder-tooltip="The HTML template for the result data items.">Item Template</label>' +
            '<textarea class="form-control" id="template" name="template" ng-model="component.template" rows="3">{{ component.template }}</textarea>' +
          '</div>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="multiple" label="Allow Multiple Resources"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the API markup.
      $templateCache.put('formio/components/resource/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],27:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('select', {
        icon: 'fa fa-th-list',
        views: [
          {
            name: 'Display',
            template: 'formio/components/select/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/select/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/select/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        onEdit: ['$scope', 'FormioUtils', function($scope, FormioUtils) {
          $scope.dataSources = {
            values: 'Values',
            json: 'Raw JSON',
            url: 'URL',
            resource: 'Resource',
            custom: 'Custom'
          };
          $scope.resources = [];
          $scope.resourceFields = [];

          // Returns only input fields we are interested in.
          var getInputFields = function(components) {
            var fields = [];
            FormioUtils.eachComponent(components, function(component) {
              if (component.key && component.input && (component.type !== 'button') && component.key !== $scope.component.key) {
                var comp = _.clone(component);
                if (!comp.label) {
                  comp.label = comp.key;
                }
                fields.push(comp);
              }
            });
            return fields;
          };

          $scope.formFields = [{label: 'Any Change', key: 'data'}].concat(getInputFields($scope.form.components));

          // Loads the selected fields.
          var loadFields = function() {
            if (!$scope.component.data.resource || ($scope.resources.length === 0)) {
              return;
            }
            var selected = null;
            $scope.resourceFields = [
              {
                property: '',
                title: '{Entire Object}'
              },
              {
                property: '_id',
                title: 'Submission Id'
              }
            ];
            if ($scope.formio.projectId) {
              $scope.component.data.project = $scope.formio.projectId;
            }
            for (var index in $scope.resources) {
              if ($scope.resources[index]._id.toString() === $scope.component.data.resource) {
                selected = $scope.resources[index];
                break;
              }
            }
            if (selected) {
              var fields = getInputFields(selected.components);
              for (var i in fields) {
                var field = fields[i];
                var title = field.label || field.key;
                $scope.resourceFields.push({
                  property: 'data.' + field.key,
                  title: title
                });
              }
              if (!$scope.component.valueProperty && $scope.resourceFields.length) {
                $scope.component.valueProperty = $scope.resourceFields[0].property;
              }
            }
          };

          $scope.$watch('component.dataSrc', function(source) {
            if (($scope.resources.length === 0) && (source === 'resource')) {
              $scope.formio.loadForms({params: {type: 'resource', limit: 4294967295}}).then(function(resources) {
                $scope.resources = resources;
                loadFields();
              });
            }
          });

          // Trigger when the resource changes.
          $scope.$watch('component.data.resource', function(resourceId) {
            if (!resourceId) {
              return;
            }
            loadFields();
          });

          // Update other parameters when the value property changes.
          $scope.currentValueProperty = $scope.component.valueProperty;
          $scope.$watch('component.valueProperty', function(property) {
            if ($scope.component.dataSrc === 'resource' && $scope.currentValueProperty !== property) {
              if (!property) {
                $scope.component.searchField = '';
                $scope.component.template = '<span>{{ item.data }}</span>';
              }
              else {
                $scope.component.searchField = property + '__regex';
                $scope.component.template = '<span>{{ item.' + property + ' }}</span>';
              }
            }
          });

          loadFields();
        }],
        documentation: 'http://help.form.io/userguide/#select'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/select/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="description"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="multiple"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/select/data.html',
        '<ng-form>' +
          '<div class="form-group">' +
            '<label for="dataSrc" form-builder-tooltip="The source to use for the select data. Values lets you provide your own values and labels. JSON lets you provide raw JSON data. URL lets you provide a URL to retrieve the JSON data from.">Data Source Type</label>' +
            '<select class="form-control" id="dataSrc" name="dataSrc" ng-model="component.dataSrc" ng-options="value as label for (value, label) in dataSources"></select>' +
          '</div>' +
          '<ng-switch on="component.dataSrc">' +
            '<div class="form-group" ng-switch-when="json">' +
              '<label for="data.json" form-builder-tooltip="A raw JSON array to use as a data source.">Data Source Raw JSON</label>' +
              '<textarea class="form-control" id="data.json" name="data.json" ng-model="component.data.json" placeholder="Raw JSON Array" json-input rows="3">{{ component.data.json }}</textarea>' +
            '</div>' +
            '<form-builder-option ng-switch-when="url" property="data.url" label="Data Source URL" placeholder="Data Source URL" title="A URL that returns a JSON array to use as the data source."></form-builder-option>' +
            '<value-builder ng-switch-when="values" data="component.data.values" label="Data Source Values" tooltip-text="Values to use as the data source. Labels are shown in the select field. Values are the corresponding values saved with the submission."></value-builder>' +
          '<div class="form-group" ng-switch-when="resource">' +
            '<label for="placeholder" form-builder-tooltip="The resource to be used with this field.">Resource</label>' +
            '<ui-select ui-select-required ui-select-open-on-focus ng-model="component.data.resource" theme="bootstrap">' +
              '<ui-select-match class="ui-select-match" placeholder="">' +
                '{{$select.selected.title}}' +
              '</ui-select-match>' +
              '<ui-select-choices class="ui-select-choices" repeat="value._id as value in resources | filter: $select.search" refresh="refreshSubmissions($select.search)" refresh-delay="250">' +
                '<div ng-bind-html="value.title | highlight: $select.search"></div>' +
              '</ui-select-choices>' +
            '</ui-select>' +
          '</div>' +
          '</ng-switch>' +
          '<form-builder-option ng-hide="component.dataSrc !== \'url\'" property="selectValues" label="Data Path" type="text" placeholder="The object path to the iterable items." title="The property within the source data, where iterable items reside. For example: results.items or results[0].items"></form-builder-option>' +
          '<form-builder-option ng-hide="component.dataSrc == \'values\' || component.dataSrc == \'resource\' || component.dataSrc == \'custom\'" property="valueProperty" label="Value Property" placeholder="The selected item\'s property to save." title="The property of each item in the data source to use as the select value. If not specified, the item itself will be used."></form-builder-option>' +
          '<div class="form-group" ng-hide="component.dataSrc !== \'resource\' || !component.data.resource || resourceFields.length == 0">' +
            '<label for="placeholder" form-builder-tooltip="The field to use as the value.">Value</label>' +
            '<select class="form-control" id="valueProperty" name="valueProperty" ng-options="value.property as value.title for value in resourceFields" ng-model="component.valueProperty"></select>' +
          '</div>' +
          '<div class="form-group" ng-if="component.dataSrc == \'resource\' && component.valueProperty === \'\'">' +
          '  <label for="placeholder" form-builder-tooltip="The properties on the resource to return as part of the options. Separate property names by commas. If left blank, all properties will be returned.">Select Fields</label>' +
          '  <input type="text" class="form-control" id="selectFields" name="selectFields" ng-model="component.selectFields" placeholder="Comma separated list of fields to select." value="{{ component.selectFields }}">' +
          '</div>' +
          '<form-builder-option ng-show="component.dataSrc == \'url\' || component.dataSrc == \'resource\'" property="searchField" label="Search Query Name" placeholder="Name of URL query parameter" title="The name of the search querystring parameter used when sending a request to filter results with. The server at the URL must handle this query parameter."></form-builder-option>' +
          '<form-builder-option ng-show="component.dataSrc == \'url\' || component.dataSrc == \'resource\'" property="filter" label="Filter Query" placeholder="The filter query for results." title="Use this to provide additional filtering using query parameters."></form-builder-option>' +
          '<div class="form-group" ng-show="component.dataSrc == \'custom\'">' +
          '  <label for="custom" form-builder-tooltip="Write custom code to return the value options. The form data object is available.">Custom Values</label>' +
          '  <textarea class="form-control" rows="10" id="custom" name="custom" ng-model="component.data.custom" placeholder="/*** Example Code ***/\nvalues = data[\'mykey\'];">{{ component.data.custom }}</textarea>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="placeholder" form-builder-tooltip="The HTML template for the result data items.">Item Template</label>' +
            '<textarea class="form-control" id="template" name="template" ng-model="component.template" rows="3">{{ component.template }}</textarea>' +
          '</div>' +
          '<div class="form-group" ng-hide="component.dataSrc == \'values\' || component.dataSrc == \'json\'">' +
          '  <label for="placeholder" form-builder-tooltip="Refresh data when another field changes.">Refresh On</label>' +
          '  <select class="form-control" id="refreshOn" name="refreshOn" ng-options="field.key as field.label for field in formFields" ng-model="component.refreshOn"></select>' +
          '</div>' +
          '<form-builder-option ng-show="component.dataSrc == \'resource\' || component.dataSrc == \'url\' || component.dataSrc == \'custom\'" property="clearOnRefresh"></form-builder-option>' +
          '<form-builder-option ng-show="component.dataSrc == \'url\'" property="authenticate"></form-builder-option>' +
          '<form-builder-option property="defaultValue"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the API markup.
      $templateCache.put('formio/components/select/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option property="unique"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],28:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('selectboxes', {
        icon: 'fa fa-plus-square',
        views: [
          {
            name: 'Display',
            template: 'formio/components/selectboxes/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/selectboxes/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/selectboxes/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#selectboxes'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/selectboxes/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<value-builder data="component.values" label="Select Boxes" tooltip-text="Checkboxes to display. Labels are shown in the form. Values are the corresponding values saved with the submission."></value-builder>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="inline" type="checkbox" label="Inline Layout" title="Displays the checkboxes horizontally."></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the API markup.
      $templateCache.put('formio/components/selectboxes/api.html',
        '<ng-form>' +
          '<form-builder-option-key></form-builder-option-key>' +
        '</ng-form>'
      );

      // Create the API markup.
      $templateCache.put('formio/components/selectboxes/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],29:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('signature', {
        icon: 'fa fa-pencil',
        views: [
          {
            name: 'Display',
            template: 'formio/components/signature/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/signature/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#signature'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/signature/display.html',
        '<ng-form>' +
          '<form-builder-option property="footer" label="Footer Label" placeholder="Footer Label" title="The footer text that appears below the signature area."></form-builder-option>' +
          '<form-builder-option property="width" label="Width" placeholder="Width" title="The width of the signature area."></form-builder-option>' +
          '<form-builder-option property="height" label="Height" placeholder="Height" title="The height of the signature area."></form-builder-option>' +
          '<form-builder-option property="backgroundColor" label="Background Color" placeholder="Background Color" title="The background color of the signature area."></form-builder-option>' +
          '<form-builder-option property="penColor" label="Pen Color" placeholder="Pen Color" title="The ink color for the signature area."></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      // Create the Validation markup.
      $templateCache.put('formio/components/signature/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],30:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('survey', {
        icon: 'fa fa-list',
        views: [
          {
            name: 'Display',
            template: 'formio/components/survey/display.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/survey/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#survey'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/survey/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<value-builder data="component.questions" default="component.questions" label="Questions" tooltip-text="The questions you would like to as in this survey question."></value-builder>' +
          '<value-builder data="component.values" default="component.values" label="Values" tooltip-text="The values that can be selected per question. Example: \'Satisfied\', \'Very Satisfied\', etc."></value-builder>' +
          '<form-builder-option property="defaultValue"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="inline" type="checkbox" label="Inline Layout" title="Displays the radio buttons horizontally."></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );
      // Create the API markup.
      $templateCache.put('formio/components/survey/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],31:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('table', {
        fbtemplate: 'formio/formbuilder/table.html',
        documentation: 'http://help.form.io/userguide/#table',
        noDndOverlay: true,
        confirmRemove: true,
        icon: 'fa fa-table',
        views: [
          {
            name: 'Display',
            template: 'formio/components/table/display.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ]
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      var tableClasses = "{'table-striped': component.striped, ";
      tableClasses += "'table-bordered': component.bordered, ";
      tableClasses += "'table-hover': component.hover, ";
      tableClasses += "'table-condensed': component.condensed}";
      $templateCache.put('formio/formbuilder/table.html',
        '<div class="table-responsive">' +
          '<table ng-class="' + tableClasses + '" class="table">' +
            '<thead ng-if="component.header.length"><tr>' +
              '<th ng-repeat="header in component.header">{{ header }}</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="row in component.rows">' +
                '<td ng-repeat="component in row">' +
                  '<form-builder-list component="component" form="form" formio="::formio"></form-builder-list>' +
                '</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>'
      );

      $templateCache.put('formio/components/table/display.html',
        '<ng-form>' +
          '<form-builder-table></form-builder-table>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="striped"></form-builder-option>' +
          '<form-builder-option property="bordered"></form-builder-option>' +
          '<form-builder-option property="hover"></form-builder-option>' +
          '<form-builder-option property="condensed"></form-builder-option>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],32:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('textarea', {
        icon: 'fa fa-font',
        views: [
          {
            name: 'Display',
            template: 'formio/components/textfield/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/textfield/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#textarea'
      });
    }
  ]);
};

},{}],33:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('textfield', {
        views: [
          {
            name: 'Display',
            template: 'formio/components/textfield/display.html'
          },
          {
            name: 'Data',
            template: 'formio/components/common/data.html'
          },
          {
            name: 'Validation',
            template: 'formio/components/textfield/validate.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Layout',
            template: 'formio/components/common/layout.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ],
        documentation: 'http://help.form.io/userguide/#textfield'
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      // Create the settings markup.
      $templateCache.put('formio/components/textfield/display.html',
        '<ng-form>' +
          '<form-builder-option property="label"></form-builder-option>' +
          '<form-builder-option property="placeholder"></form-builder-option>' +
          '<form-builder-option property="description"></form-builder-option>' +
          '<form-builder-option property="inputMask"></form-builder-option>' +
          '<form-builder-option property="prefix"></form-builder-option>' +
          '<form-builder-option property="suffix"></form-builder-option>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
          '<form-builder-option property="tabindex"></form-builder-option>' +
          '<form-builder-option property="multiple"></form-builder-option>' +
          '<form-builder-option property="protected"></form-builder-option>' +
          '<form-builder-option property="persistent"></form-builder-option>' +
          '<form-builder-option property="disabled"></form-builder-option>' +
          '<form-builder-option property="tableView"></form-builder-option>' +
        '</ng-form>'
      );

      $templateCache.put('formio/components/textfield/validate.html',
        '<ng-form>' +
          '<form-builder-option property="validate.required"></form-builder-option>' +
          '<form-builder-option property="unique"></form-builder-option>' +
          '<form-builder-option property="validate.minLength"></form-builder-option>' +
          '<form-builder-option property="validate.maxLength"></form-builder-option>' +
          '<form-builder-option property="validate.pattern"></form-builder-option>' +
          '<form-builder-option-custom-validation></form-builder-option-custom-validation>' +
        '</ng-form>'
      );
    }
  ]);
};

},{}],34:[function(_dereq_,module,exports){
"use strict";
module.exports = function(app) {
  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('well', {
        fbtemplate: 'formio/formbuilder/well.html',
        icon: 'fa fa-square-o',
        documentation: 'http://help.form.io/userguide/#well',
        noDndOverlay: true,
        confirmRemove: true,
        views: [
          {
            name: 'Display',
            template: 'formio/components/common/display.html'
          },
          {
            name: 'API',
            template: 'formio/components/common/api.html'
          },
          {
            name: 'Conditional',
            template: 'formio/components/common/conditional.html'
          }
        ]
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/formbuilder/well.html',
        '<div class="well">' +
          '<form-builder-list component="component" form="form" formio="::formio"></form-builder-list>' +
        '</div>'
      );
      $templateCache.put('formio/components/common/display.html',
        '<ng-form>' +
          '<form-builder-option property="customClass"></form-builder-option>' +
        '<ng-form>'
      );
    }
  ]);
};

},{}],35:[function(_dereq_,module,exports){
"use strict";
/**
  * These are component options that can be reused
  * with the builder-option directive
  * Valid properties: label, placeholder, tooltip, type
  */
module.exports = {
  label: {
    label: 'Label',
    placeholder: 'Field Label',
    tooltip: 'The label for this field that will appear next to it.'
  },
  defaultValue: {
    label: 'Default Value',
    placeholder: 'Default Value',
    tooltip: 'The will be the value for this field, before user interaction. Having a default value will override the placeholder text.'
  },
  placeholder: {
    label: 'Placeholder',
    placeholder: 'Placeholder',
    tooltip: 'The placeholder text that will appear when this field is empty.'
  },
  description: {
    label: 'Description',
    placeholder: 'Description for this field.',
    tooltip: 'The description is text that will appear below the input field.'
  },
  inputMask: {
    label: 'Input Mask',
    placeholder: 'Input Mask',
    tooltip: 'An input mask helps the user with input by ensuring a predefined format.<br><br>9: numeric<br>a: alphabetical<br>*: alphanumeric<br><br>Example telephone mask: (999) 999-9999<br><br>See the <a target=\'_blank\' href=\'https://github.com/RobinHerbots/jquery.inputmask\'>jquery.inputmask documentation</a> for more information.</a>'
  },
  authenticate: {
    label: 'Formio Authenticate',
    tooltip: 'Check this if you would like to use Formio Authentication with the request.',
    type: 'checkbox'
  },
  tableView: {
    label: 'Table View',
    type: 'checkbox',
    tooltip: 'Shows this value within the table view of the submissions.'
  },
  prefix: {
    label: 'Prefix',
    placeholder: 'example \'$\', \'@\'',
    tooltip: 'The text to show before a field.'
  },
  suffix: {
    label: 'Suffix',
    placeholder: 'example \'$\', \'@\'',
    tooltip: 'The text to show after a field.'
  },
  multiple: {
    label: 'Multiple Values',
    type: 'checkbox',
    tooltip: 'Allows multiple values to be entered for this field.'
  },
  disabled: {
    label: 'Disabled',
    type: 'checkbox',
    tooltip: 'Disable the form input.'
  },
  clearOnRefresh: {
    label: 'Clear Value On Refresh',
    type: 'checkbox',
    tooltip: 'When the Refresh On field is changed, clear the selected value.'
  },
  unique: {
    label: 'Unique',
    type: 'checkbox',
    tooltip: 'Makes sure the data submitted for this field is unique, and has not been submitted before.'
  },
  protected: {
    label: 'Protected',
    type: 'checkbox',
    tooltip: 'A protected field will not be returned when queried via API.'
  },
  image: {
    label: 'Display as images',
    type: 'checkbox',
    tooltip: 'Instead of a list of linked files, images will be rendered in the view.'
  },
  imageSize: {
    label: 'Image Size',
    placeholder: '100',
    tooltip: 'The image size for previewing images.'
  },
  persistent: {
    label: 'Persistent',
    type: 'checkbox',
    tooltip: 'A persistent field will be stored in database when the form is submitted.'
  },
  block: {
    label: 'Block',
    type: 'checkbox',
    tooltip: 'This control should span the full width of the bounding container.'
  },
  leftIcon: {
    label: 'Left Icon',
    placeholder: 'Enter icon classes',
    tooltip: 'This is the full icon class string to show the icon. Example: \'glyphicon glyphicon-search\' or \'fa fa-plus\''
  },
  rightIcon: {
    label: 'Right Icon',
    placeholder: 'Enter icon classes',
    tooltip: 'This is the full icon class string to show the icon. Example: \'glyphicon glyphicon-search\' or \'fa fa-plus\''
  },
  url: {
    label: 'Upload Url',
    placeholder: 'Enter the url to post the files to.',
    tooltip: 'See <a href=\'https://github.com/danialfarid/ng-file-upload#server-side\' target=\'_blank\'>https://github.com/danialfarid/ng-file-upload#server-side</a> for how to set up the server.'
  },
  dir: {
    label: 'Directory',
    placeholder: '(optional) Enter a directory for the files',
    tooltip: 'This will place all the files uploaded in this field in the directory'
  },
  disableOnInvalid: {
    label: 'Disable on Form Invalid',
    type: 'checkbox',
    tooltip: 'This will disable this field if the form is invalid.'
  },
  striped: {
    label: 'Striped',
    type: 'checkbox',
    tooltip: 'This will stripe the table if checked.'
  },
  bordered: {
    label: 'Bordered',
    type: 'checkbox',
    tooltip: 'This will border the table if checked.'
  },
  hover: {
    label: 'Hover',
    type: 'checkbox',
    tooltip: 'Highlight a row on hover.'
  },
  condensed: {
    label: 'Condensed',
    type: 'checkbox',
    tooltip: 'Condense the size of the table.'
  },
  datagridLabel: {
    label: 'Datagrid Label',
    type: 'checkbox',
    tooltip: 'Show the label when in a datagrid.'
  },
  'validate.required': {
    label: 'Required',
    type: 'checkbox',
    tooltip: 'A required field must be filled in before the form can be submitted.'
  },
  'validate.minLength': {
    label: 'Minimum Length',
    placeholder: 'Minimum Length',
    type: 'number',
    tooltip: 'The minimum length requirement this field must meet.'
  },
  'validate.maxLength': {
    label: 'Maximum Length',
    placeholder: 'Maximum Length',
    type: 'number',
    tooltip: 'The maximum length requirement this field must meet'
  },
  'validate.pattern': {
    label: 'Regular Expression Pattern',
    placeholder: 'Regular Expression Pattern',
    tooltip: 'The regular expression pattern test that the field value must pass before the form can be submitted.'
  },
  'customClass': {
    label: 'Custom CSS Class',
    placeholder: 'Custom CSS Class',
    tooltip: 'Custom CSS class to add to this component.'
  },
  'tabindex': {
    label: 'Tab Index',
    placeholder: 'Tab Index',
    tooltip: 'Sets the tabindex attribute of this component to override the tab order of the form. See the <a href=\'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex\'>MDN documentation</a> on tabindex for more information.'
  },
  'addAnother': {
    label: 'Add Another Text',
    placeholder: 'Add Another',
    tooltip: 'Set the text of the Add Another button.'
  },
  'defaultDate': {
    label: 'Default Value',
    placeholder: 'Default Value',
    tooltip: 'You can use Moment.js functions to set the default value to a specific date. For example: \n \n moment().subtract(10, \'days\').calendar();'
  },
  // Need to use array notation to have dash in name
  'style[\'margin-top\']': {
    label: 'Margin Top',
    placeholder: '0px',
    tooltip: 'Sets the top margin of this component. Must be a valid CSS measurement like `10px`.'
  },
  'style[\'margin-right\']': {
    label: 'Margin Right',
    placeholder: '0px',
    tooltip: 'Sets the right margin of this component. Must be a valid CSS measurement like `10px`.'
  },
  'style[\'margin-bottom\']': {
    label: 'Margin Bottom',
    placeholder: '0px',
    tooltip: 'Sets the bottom margin of this component. Must be a valid CSS measurement like `10px`.'
  },
  'style[\'margin-left\']': {
    label: 'Margin Left',
    placeholder: '0px',
    tooltip: 'Sets the left margin of this component. Must be a valid CSS measurement like `10px`.'
  }
};

},{}],36:[function(_dereq_,module,exports){
"use strict";
module.exports = {
  actions: [
    {
      name: 'submit',
      title: 'Submit'
    },
    {
      name: 'event',
      title: 'Event'
    },
    {
      name: 'reset',
      title: 'Reset'
    },
    {
      name: 'oauth',
      title: 'OAuth'
    }
  ],
  themes: [
    {
      name: 'default',
      title: 'Default'
    },
    {
      name: 'primary',
      title: 'Primary'
    },
    {
      name: 'info',
      title: 'Info'
    },
    {
      name: 'success',
      title: 'Success'
    },
    {
      name: 'danger',
      title: 'Danger'
    },
    {
      name: 'warning',
      title: 'Warning'
    }
  ],
  sizes: [
    {
      name: 'xs',
      title: 'Extra Small'
    },
    {
      name: 'sm',
      title: 'Small'
    },
    {
      name: 'md',
      title: 'Medium'
    },
    {
      name: 'lg',
      title: 'Large'
    }
  ]
};

},{}],37:[function(_dereq_,module,exports){
"use strict";
/*eslint max-statements: 0*/
module.exports = ['debounce', function(debounce) {
  return {
    replace: true,
    templateUrl: 'formio/formbuilder/builder.html',
    scope: {
      form: '=?',
      src: '=',
      type: '=',
      onSave: '=',
      onCancel: '=',
      options: '=?'
    },
    controller: [
      '$scope',
      'formioComponents',
      'ngDialog',
      'Formio',
      'FormioUtils',
      'dndDragIframeWorkaround',
      '$interval',
      function(
        $scope,
        formioComponents,
        ngDialog,
        Formio,
        FormioUtils,
        dndDragIframeWorkaround,
        $interval
      ) {
        $scope.options = $scope.options || {};

        // Add the components to the scope.
        var submitButton = angular.copy(formioComponents.components.button.settings);
        if (!$scope.form) {
          $scope.form = {};
        }
        if (!$scope.form.components) {
          $scope.form.components = [];
        }
        if (!$scope.options.noSubmit && !$scope.form.components.length) {
          $scope.form.components.push(submitButton);
        }
        $scope.hideCount = 2;
        $scope.form.page = 0;
        $scope.formio = $scope.src ? new Formio($scope.src) : null;

        var setNumPages = function() {
          if (!$scope.form) {
            return;
          }
          if ($scope.form.display !== 'wizard') {
            return;
          }

          var numPages = 0;
          $scope.form.components.forEach(function(component) {
            if (component.type === 'panel') {
              numPages++;
            }
          });

          $scope.form.numPages = numPages;

          // Add a page if none is found.
          if (numPages === 0) {
            $scope.newPage();
          }

          // Make sure the page doesn't excede the end.
          if ((numPages > 0) && ($scope.form.page >= numPages)) {
            $scope.form.page = numPages - 1;
          }
        };

        // Load the form.
        if ($scope.formio && $scope.formio.formId) {
          $scope.formio.loadForm().then(function(form) {
            $scope.form = form;
            $scope.form.page = 0;
            if (!$scope.options.noSubmit && $scope.form.components.length === 0) {
              $scope.form.components.push(submitButton);
            }
          });
        }

        $scope.$watch('form.display', function(display) {
          $scope.hideCount = (display === 'wizard') ? 1 : 2;
        });

        // Make sure they can switch back and forth between wizard and pages.
        $scope.$on('formDisplay', function(event, display) {
          $scope.form.display = display;
          $scope.form.page = 0;
          setNumPages();
        });

        // Return the form pages.
        $scope.pages = function() {
          var pages = [];
          $scope.form.components.forEach(function(component) {
            if (component.type === 'panel') {
              if (component.title) {
                pages.push(component.title);
              }
              else {
                pages.push('Page ' + (pages.length + 1));
              }
            }
          });
          return pages;
        };

        // Show the form page.
        $scope.showPage = function(page) {
          var i = 0;
          for (i = 0; i < $scope.form.components.length; i++) {
            var component = $scope.form.components[i];
            if (component.type === 'panel') {
              if (i === page) {
                break;
              }
            }
          }
          $scope.form.page = i;
        };

        $scope.newPage = function() {
          var index = $scope.form.numPages;
          var pageNum = index + 1;
          var component = {
            type: 'panel',
            title: 'Page ' + pageNum,
            isNew: true,
            components: [],
            input: false,
            key: 'page' + pageNum
          };
          $scope.form.numPages++;
          $scope.form.components.splice(index, 0, component);
        };

        // Ensure the number of pages is always correct.
        $scope.$watch('form.components.length', function() {
          setNumPages();
        });

        $scope.formComponents = _.cloneDeep(formioComponents.components);
        _.each($scope.formComponents, function(component, key) {
          component.settings.isNew = true;
          if (component.settings.hasOwnProperty('builder') && !component.settings.builder || component.disabled) {
            delete $scope.formComponents[key];
          }
        });

        $scope.formComponentGroups = _.cloneDeep(_.omitBy(formioComponents.groups, 'disabled'));
        $scope.formComponentsByGroup = _.groupBy($scope.formComponents, function(component) {
          return component.group;
        });

        // Get the resource fields.
        var resourceEnabled = !formioComponents.groups.resource || !formioComponents.groups.resource.disabled;
        if ($scope.formio && resourceEnabled) {
          $scope.formComponentsByGroup.resource = {};
          $scope.formComponentGroups.resource = {
            title: 'Existing Resource Fields',
            panelClass: 'subgroup-accordion-container',
            subgroups: {}
          };

          $scope.formio.loadForms({params: {type: 'resource', limit: 100}}).then(function(resources) {
            // Iterate through all resources.
            _.each(resources, function(resource) {
              var resourceKey = resource.name;

              // Add a legend for this resource.
              $scope.formComponentsByGroup.resource[resourceKey] = [];
              $scope.formComponentGroups.resource.subgroups[resourceKey] = {
                title: resource.title
              };

              // Iterate through each component.
              FormioUtils.eachComponent(resource.components, function(component) {
                if (component.type === 'button') return;

                var componentName = component.label;
                if (!componentName && component.key) {
                  componentName = _.upperFirst(component.key);
                }

                $scope.formComponentsByGroup.resource[resourceKey].push(_.merge(
                  _.cloneDeep(formioComponents.components[component.type], true),
                  {
                    title: componentName,
                    group: 'resource',
                    subgroup: resourceKey,
                    settings: component
                  },
                  {
                    settings: {
                      label: component.label,
                      key: component.key,
                      lockKey: true,
                      source: resource._id
                    }
                  }
                ));
              });
            });
          });
        }

        var update = function() {
          $scope.$emit('formUpdate', $scope.form);
        };

        // Add a new component.
        $scope.$on('formBuilder:add', update);
        $scope.$on('formBuilder:update', update);
        $scope.$on('formBuilder:remove', update);
        $scope.$on('formBuilder:edit', update);

        $scope.saveSettings = function() {
          ngDialog.closeAll(true);
          $scope.$emit('formUpdate', $scope.form);
        };

        $scope.capitalize = _.capitalize;

        // Set the root list height to the height of the formbuilder for ease of form building.
        var rootlistEL = angular.element('.rootlist');
        var formbuilderEL = angular.element('.formbuilder');

        $interval(function setRootListHeight() {
          var listHeight = rootlistEL.height('inherit').height();
          var builderHeight = formbuilderEL.height();
          if ((builderHeight - listHeight) > 100) {
            rootlistEL.height(builderHeight);
          }
        }, 1000);

        // Add to scope so it can be used in templates
        $scope.dndDragIframeWorkaround = dndDragIframeWorkaround;
      }
    ],
    link: function(scope, element) {
      var scrollSidebar = debounce(function() {
        // Disable all buttons within the form.
        angular.element('.formbuilder').find('button').attr('disabled', 'disabled');

        // Make the left column follow the form.
        var formComponents = angular.element('.formcomponents');
        var formBuilder = angular.element('.formbuilder');
        if (formComponents.length !== 0 && formBuilder.length !== 0) {
          var maxScroll = formBuilder.outerHeight() > formComponents.outerHeight() ? formBuilder.outerHeight() - formComponents.outerHeight() : 0;
          // 50 pixels gives space for the fixed header.
          var scroll = angular.element(window).scrollTop() - formComponents.parent().offset().top + 50;
          if (scroll < 0) {
            scroll = 0;
          }
          if (scroll > maxScroll) {
            scroll = maxScroll;
          }
          formComponents.css('margin-top', scroll + 'px');
        }
      }, 100, false);
      window.onscroll = scrollSidebar;
      element.on('$destroy', function() {
        window.onscroll = null;
      });
    }
  };
}];

},{}],38:[function(_dereq_,module,exports){
"use strict";
/**
 * Create the form-builder-component directive.
 * Extend the formio-component directive and change the template.
 */
module.exports = [
  'formioComponentDirective',
  function(formioComponentDirective) {
    return angular.extend({}, formioComponentDirective[0], {
      scope: false,
      templateUrl: 'formio/formbuilder/component.html'
    });
  }
];

},{}],39:[function(_dereq_,module,exports){
"use strict";
'use strict';

var utils = _dereq_('formio-utils');

module.exports = [
  function() {
    return {
      restrict: 'E',
      scope: true,
      template: '' +
        '<uib-accordion>' +
          '<div uib-accordion-group heading="Simple" class="panel panel-default" is-open="status.simple">' +
            'This component should Display:' +
            '<select class="form-control input-md" ng-model="component.conditional.show">' +
            '<option ng-repeat="item in _booleans track by $index" value="{{item}}">{{item.toString()}}</option>' +
            '</select>' +
            '<br>When the form component:' +
            '<select class="form-control input-md" ng-model="component.conditional.when">' +
            '<option ng-repeat="item in _components track by $index" value="{{item.key}}">{{item !== "" ? item.label + " (" + item.key + ")" : ""}}</option>' +
            '</select>' +
            '<br>Has the value:' +
            '<input type="text" class="form-control input-md" ng-model="component.conditional.eq">' +
          '</div>' +
          '<div uib-accordion-group heading="When" class="panel panel-default" is-open="status.advanced">' +
            '<div class="when-block" ng-repeat="condition in component.whenConditions">' +
              '<div style="display: flex; justify-content: space-between">When form value is: <a ng-click="removeWhenCondition($index)" class="btn btn-default"><span class="glyphicon glyphicon-remove-circle"></span></a></div>' +
              '<formio-component component="component" data="condition.value" formio="::formio"></formio-component>' +
              'Then:' +
              '<select class="form-control input-md" ng-model="component.whenConditions[0].type" ng-options="type.id as type.label for type in conditions"></select>' +
              '<ng-include ng-if="condition.type" src="\'form-action\' + condition.type"></ng-include>' +
              '<hr>'+
            '</div>' +
            '<a ng-click="addWhenCondition()" class="btn btn-primary ng-binding"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add Another</a>' +
          '</div>' +
          '<div uib-accordion-group heading="Scripting" class="panel panel-default" is-open="status.advanced">' +
            '<textarea class="form-control" rows="5" id="custom" name="custom" ng-model="component.customConditional" placeholder="/*** Example Code ***/\nshow = (data[\'mykey\'] > 1);"></textarea>' +
            '<small>' +
            '<p>Enter custom conditional code.</p>' +
            '<p>You must assign the <strong>show</strong> variable as either <strong>true</strong> or <strong>false</strong>.</p>' +
            '<p>The global variable <strong>data</strong> is provided, and allows you to access the data of any form component, by using its API key.</p>' +
            '<p><strong>Note: Advanced Conditional logic will override the results of the Simple Conditional logic.</strong></p>' +
            '</small>' +
          '</div>' +
        '</uib-accordion>',
      controller: [
        '$scope',
        '$templateCache',
        'formioComponents',
        function($scope, $templateCache, formioComponents) {
          // Default the current components conditional logic.
          $scope.component = $scope.component || {};
          $scope.component.conditional = $scope.component.conditional || {};
          var conditions = formioComponents.conditions;
          $scope.conditions = [];
          for (var key in conditions) {
            if (conditions.hasOwnProperty(key)) {
              var condition = conditions[key];
              $templateCache.put('form-action' + key, condition.template);
              $scope.conditions.push(condition);
            }
          }

          $scope.component.whenConditions = $scope.component.whenConditions || [];

          // The available logic functions.
          $scope._booleans = ['', 'true', 'false'];

          // Filter the list of available form components for conditional logic.
          $scope._components = _.get($scope, 'form.components') || [];
          $scope._components = utils.flattenComponents($scope._components);
          // Remove non-input/button fields because they don't make sense.
          // FA-890 - Dont allow the current component to be a conditional trigger.
          $scope._components = _.reject($scope._components, function(c) {
            return !c.input || (c.type === 'button') || (c.key === $scope.component.key) || (!c.label && !c.key);
          });

          // Add default item to the components list.
          $scope._components.unshift('');

          // Default and watch the show logic.
          $scope.component.conditional.show = $scope.component.conditional.show || '';
          // Coerce show var to supported value.
          var _booleanMap = {
            '': '',
            'true': 'true',
            'false': 'false'
          };
          $scope.component.conditional.show = _booleanMap.hasOwnProperty($scope.component.conditional.show)
            ? _booleanMap[$scope.component.conditional.show]
            : '';

          // Default and watch the when logic.
          $scope.component.conditional.when = $scope.component.conditional.when || null;

          // Default and watch the search logic.
          $scope.component.conditional.eq = $scope.component.conditional.eq || '';

          // Track the status of the accordion panels open state.
          $scope.status = {
            simple: !$scope.component.customConditional,
            advanced: !!$scope.component.customConditional
          };

          $scope.addWhenCondition = function() {
            $scope.component.whenConditions.push({});
          };

          $scope.removeWhenCondition = function(index) {
            $scope.component.whenConditions.splice(index, 1);
          };
        }
      ]
    };
  }
];

},{"formio-utils":1}],40:[function(_dereq_,module,exports){
"use strict";
module.exports = [
  '$scope',
  '$rootScope',
  'formioComponents',
  'ngDialog',
  'dndDragIframeWorkaround',
  function(
    $scope,
    $rootScope,
    formioComponents,
    ngDialog,
    dndDragIframeWorkaround
  ) {
    $scope.builder = true;
    $rootScope.builder = true;
    $scope.hideCount = (_.isNumber($scope.hideDndBoxCount) ? $scope.hideDndBoxCount : 1);
    $scope.$watch('hideDndBoxCount', function(hideCount) {
      $scope.hideCount = hideCount ? hideCount : 1;
    });

    $scope.formComponents = formioComponents.components;

    // Components depend on this existing
    $scope.data = {};

    $scope.emit = function() {
      var args = [].slice.call(arguments);
      args[0] = 'formBuilder:' + args[0];
      $scope.$emit.apply($scope, args);
    };

    $scope.addComponent = function(component, index) {
      // Only edit immediately for components that are not resource comps.
      if (component.isNew && (!component.key || (component.key.indexOf('.') === -1))) {
        $scope.editComponent(component);
      }
      else {
        component.isNew = false;
      }

      // Refresh all CKEditor instances
      $scope.$broadcast('ckeditor.refresh');

      dndDragIframeWorkaround.isDragging = false;
      $scope.emit('add');

      // If this is a root component and the display is a wizard, then we know
      // that they dropped the component outside of where it is supposed to go...
      // Instead append or prepend to the components array.
      if ($scope.component.display === 'wizard') {
        $scope.$apply(function() {
          var pageIndex = (index === 0) ? 0 : $scope.form.components[$scope.form.page].components.length;
          $scope.form.components[$scope.form.page].components.splice(pageIndex, 0, component);
        });
        return true;
      }

      // Make sure that they don't ever add a component on the bottom of the submit button.
      var lastComponent = $scope.component.components[$scope.component.components.length - 1];
      if (
        (lastComponent) &&
        (lastComponent.type === 'button') &&
        (lastComponent.action === 'submit')
      ) {
        // There is only one element on the page.
        if ($scope.component.components.length === 1) {
          index = 0;
        }
        else if (index >= $scope.component.components.length) {
          index -= 1;
        }
      }

      // Add the component to the components array.
      $scope.$apply(function() {
        $scope.component.components.splice(index, 0, component);
      });

      // Return true since this will tell the drag-and-drop list component to not insert into its own array.
      return true;
    };

    // Allow prototyped scopes to update the original component.
    $scope.updateComponent = function(newComponent, oldComponent) {
      var list = $scope.component.components;
      list.splice(list.indexOf(oldComponent), 1, newComponent);
      $scope.$emit('update', newComponent);
    };

    var remove = function(component) {
      if ($scope.component.components.indexOf(component) !== -1) {
        $scope.component.components.splice($scope.component.components.indexOf(component), 1);
        $scope.emit('remove', component);
      }
    };

    $scope.removeComponent = function(component, shouldConfirm) {
      if (shouldConfirm) {
        // Show confirm dialog before removing a component
        ngDialog.open({
          template: 'formio/components/confirm-remove.html',
          showClose: false
        }).closePromise.then(function(e) {
          var cancelled = e.value === false || e.value === '$closeButton' || e.value === '$document';
          if (!cancelled) {
            remove(component);
          }
        });
      }
      else {
        remove(component);
      }
    };

    // Return the form pages.
    $scope.getPages = function() {
      var pages = [];
      $scope.form.components.forEach(function(component, index) {
        component = angular.copy(component);
        if (component.type === 'panel') {
          if (!component.title) {
            component.title = 'Page ' + (index + 1);
          }

          pages.push(component);
        }
      });
      return pages;
    };

    // Edit a specific component.
    $scope.editComponent = function(component) {
      $scope.formComponent = formioComponents.components[component.type] || formioComponents.components.custom;
      // No edit view available
      if (!$scope.formComponent.hasOwnProperty('views')) {
        return;
      }

      // Create child isolate scope for dialog
      var childScope = $scope.$new(false);
      childScope.component = component;
      childScope.form = $scope.form;
      childScope.pages = $scope.getPages();
      childScope.data = {};
      if (component.key) {
        childScope.data[component.key] = component.multiple ? [''] : '';
      }

      var previousSettings = angular.copy(component);

      // Open the dialog.
      ngDialog.open({
        template: 'formio/components/settings.html',
        scope: childScope,
        className: 'ngdialog-theme-default component-settings',
        controller: ['$scope', 'Formio', '$controller', function($scope, Formio, $controller) {
          // Allow the component to add custom logic to the edit page.
          if (
            $scope.formComponent && $scope.formComponent.onEdit
          ) {
            $controller($scope.formComponent.onEdit, {$scope: $scope});
          }

          $scope.$watch('component.multiple', function(value) {
            $scope.data[$scope.component.key] = value ? [''] : '';
          });

          // Watch the settings label and auto set the key from it.
          var invalidRegex = /^[^A-Za-z]*|[^A-Za-z0-9\-]*/g;
          $scope.$watch('component.label', function() {
            if ($scope.component.label && !$scope.component.lockKey && $scope.component.isNew) {
              if ($scope.data.hasOwnProperty($scope.component.key)) {
                delete $scope.data[$scope.component.key];
              }
              $scope.component.key = _.camelCase($scope.component.label.replace(invalidRegex, ''));
              $scope.data[$scope.component.key] = $scope.component.multiple ? [''] : '';
            }
          });
        }]
      }).closePromise.then(function(e) {
        var cancelled = e.value === false || e.value === '$closeButton' || e.value === '$document';
        if (cancelled) {
          if (component.isNew) {
            remove(component);
          }
          else {
            // Revert to old settings, but use the same object reference
            _.assign(component, previousSettings);
          }
        }
        else {
          delete component.isNew;
          $scope.emit('edit', component);
        }
      });
    };

    // Add to scope so it can be used in templates
    $scope.dndDragIframeWorkaround = dndDragIframeWorkaround;
  }
];

},{}],41:[function(_dereq_,module,exports){
"use strict";
module.exports = [
  'formioElementDirective',
  function(formioElementDirective) {
    return angular.extend({}, formioElementDirective[0], {
      scope: false,
      controller: [
        '$scope',
        'formioComponents',
        function(
          $scope,
          formioComponents
        ) {
          $scope.builder = true;
          $scope.formComponent = formioComponents.components[$scope.component.type] || formioComponents.components.custom;
          if ($scope.formComponent.fbtemplate) {
            $scope.template = $scope.formComponent.fbtemplate;
          }
        }
      ]
    });
  }
];

},{}],42:[function(_dereq_,module,exports){
"use strict";
module.exports = [
  function() {
    return {
      scope: {
        component: '=',
        formio: '=',
        form: '=',
        // # of items needed in the list before hiding the
        // drag and drop prompt div
        hideDndBoxCount: '=',
        rootList: '='
      },
      restrict: 'E',
      replace: true,
      controller: 'formBuilderDnd',
      templateUrl: 'formio/formbuilder/list.html'
    };
  }
];

},{}],43:[function(_dereq_,module,exports){
"use strict";
/**
* This directive creates a field for tweaking component options.
* This needs at least a property attribute specifying what property
* of the component to bind to.
*
* If the property is defined in COMMON_OPTIONS above, it will automatically
* populate its label, placeholder, input type, and tooltip. If not, you may specify
* those via attributes (except for tooltip, which you can specify with the title attribute).
* The generated input will also carry over any other properties you specify on this directive.
*/
module.exports = ['COMMON_OPTIONS', function(COMMON_OPTIONS) {
  return {
    restrict: 'E',
    require: 'property',
    priority: 2,
    replace: true,
    template: function(el, attrs) {
      var property = attrs.property;
      var label = attrs.label || (COMMON_OPTIONS[property] && COMMON_OPTIONS[property].label) || '';
      var placeholder = (COMMON_OPTIONS[property] && COMMON_OPTIONS[property].placeholder) || null;
      var type = (COMMON_OPTIONS[property] && COMMON_OPTIONS[property].type) || 'text';
      var tooltip = (COMMON_OPTIONS[property] && COMMON_OPTIONS[property].tooltip) || '';

      var input = angular.element('<input>');
      var inputAttrs = {
        id: property,
        name: property,
        type: type,
        'ng-model': 'component.' + property,
        placeholder: placeholder
      };
      // Pass through attributes from the directive to the input element
      angular.forEach(attrs.$attr, function(key) {
        inputAttrs[key] = attrs[key];
        // Allow specifying tooltip via title attr
        if (key.toLowerCase() === 'title') {
          tooltip = attrs[key];
        }
      });

      // Add min/max value floor values for validation.
      if (property === 'validate.minLength' || property === 'validate.maxLength') {
        inputAttrs.min = 0;
      }

      input.attr(inputAttrs);

      // Checkboxes have a slightly different layout
      if (inputAttrs.type.toLowerCase() === 'checkbox') {
        return '<div class="checkbox">' +
                '<label for="' + property + '" form-builder-tooltip="' + tooltip + '">' +
                input.prop('outerHTML') +
                ' ' + label + '</label>' +
              '</div>';
      }

      input.addClass('form-control');
      return '<div class="form-group">' +
                '<label for="' + property + '" form-builder-tooltip="' + tooltip + '">' + label + '</label>' +
                input.prop('outerHTML') +
              '</div>';
    }
  };
}];

},{}],44:[function(_dereq_,module,exports){
"use strict";
/**
* A directive for editing a component's custom validation.
*/
module.exports = function() {
  return {
    restrict: 'E',
    replace: true,
    template: '' +
      '<div class="panel panel-default" id="accordion">' +
        '<div class="panel-heading" data-toggle="collapse" data-parent="#accordion" data-target="#validationSection">' +
          '<span class="panel-title">Custom Validation</span>' +
        '</div>' +
        '<div id="validationSection" class="panel-collapse collapse in">' +
          '<div class="panel-body">' +
            '<textarea class="form-control" rows="5" id="custom" name="custom" ng-model="component.validate.custom" placeholder="/*** Example Code ***/\nvalid = (input === 3) ? true : \'Must be 3\';">{{ component.validate.custom }}</textarea>' +
            '<small>' +
              '<p>Enter custom validation code.</p>' +
              '<p>You must assign the <strong>valid</strong> variable as either <strong>true</strong> or an error message if validation fails.</p>' +
              '<p>The global variables <strong>input</strong>, <strong>component</strong>, and <strong>valid</strong> are provided.</p>' +
            '</small>' +
            '<div class="well">' +
              '<div class="checkbox">' +
                '<label>' +
                  '<input type="checkbox" id="private" name="private" ng-model="component.validate.customPrivate" ng-checked="component.validate.customPrivate"> <strong>Secret Validation</strong>' +
                '</label>' +
              '</div>' +
              '<p>Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
  };
};

},{}],45:[function(_dereq_,module,exports){
"use strict";
/**
* A directive for a field to edit a component's key.
*/
module.exports = function() {
  return {
    restrict: 'E',
    replace: true,
    template: function() {
      return '<div class="form-group" ng-class="{\'has-warning\': shouldWarnAboutEmbedding()}">' +
                '<label for="key" class="control-label" form-builder-tooltip="The name of this field in the API endpoint.">Property Name</label>' +
                '<input type="text" class="form-control" id="key" name="key" ng-model="component.key" valid-api-key value="{{ component.key }}" ' +
                'ng-disabled="component.source" ng-blur="onBlur()">' +
                '<p ng-if="shouldWarnAboutEmbedding()" class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> ' +
                  'Using a dot in your Property Name will link this field to a field from a Resource. Doing this manually is not recommended because you will experience unexpected behavior if the Resource field is not found. If you wish to embed a Resource field in your form, use a component from the corresponding Resource Components category on the left.' +
                '</p>' +
              '</div>';
    },
    controller: ['$scope', 'FormioUtils', function($scope, FormioUtils) {
      var suffixRegex = /(\d+)$/;

      // Prebuild a list of existing components.
      var existingComponents = {};
      FormioUtils.eachComponent($scope.form.components, function(component) {
        // Don't add to existing components if current component or if it is new. (New could mean same as another item).
        if (component.key && ($scope.component.key !== component.key || $scope.component.isNew)) {
          existingComponents[component.key] = component;
        }
      }, true);

      var keyExists = function(component) {
        if (existingComponents.hasOwnProperty(component.key)) {
          return true;
        }
        return false;
      };

      var iterateKey = function(componentKey) {
        if (!componentKey.match(suffixRegex)) {
          return componentKey + '1';
        }

        return componentKey.replace(suffixRegex, function(suffix) {
          return Number(suffix) + 1;
        });
      };

      // Appends a number to a component.key to keep it unique
      var uniquify = function() {
        if (!$scope.component.key) {
          return;
        }
        while (keyExists($scope.component)) {
          $scope.component.key = iterateKey($scope.component.key);
        }
      };

      $scope.$watch('component.key', uniquify);

      $scope.onBlur = function() {
        $scope.component.lockKey = true;

        // If they try to input an empty key, refill it with default and let uniquify
        // make it unique
        if (!$scope.component.key && $scope.formComponents[$scope.component.type].settings.key) {
          $scope.component.key = $scope.formComponents[$scope.component.type].settings.key;
          $scope.component.lockKey = false; // Also unlock key
          uniquify();
        }
      };

      $scope.shouldWarnAboutEmbedding = function() {
        if (!$scope.component || !$scope.component.key) {
          return false;
        }
        return !$scope.component.source && $scope.component.key.indexOf('.') !== -1;
      };
    }]
  };
};

},{}],46:[function(_dereq_,module,exports){
"use strict";
/**
* A directive for a field to edit a component's tags.
*/
module.exports = function() {
  return {
    restrict: 'E',
    replace: true,
    template: function() {
      return '' +
        '<div class="form-group">' +
        '  <label class="control-label" form-builder-tooltip="Tag the field for use in custom logic.">Field Tags</label>' +
        '  <tags-input ng-model="tags" on-tag-added="addTag($tag)" on-tag-removed="removeTag($tag)"></tags-input>' +
        '</div>';
    },
    controller: ['$scope', function($scope) {
      $scope.component.tags = $scope.component.tags || [];
      $scope.tags = _.map($scope.component.tags, function(tag) {
        return {text: tag};
      });

      $scope.addTag = function(tag) {
        if (!$scope.component) {
          return;
        }
        if (!$scope.component.tags) {
          $scope.component.tags = [];
        }
        $scope.component.tags.push(tag.text);
      };
      $scope.removeTag = function(tag) {
        if ($scope.component.tags && $scope.component.tags.length) {
          var tagIndex = $scope.component.tags.indexOf(tag.text);
          if (tagIndex !== -1) {
            $scope.component.tags.splice(tagIndex, 1);
          }
        }
      };
    }]
  };
};

},{}],47:[function(_dereq_,module,exports){
"use strict";
module.exports = [
  function() {
    return {
      scope: {
        component: '=',
        formio: '=',
        form: '=',
        // # of items needed in the list before hiding the
        // drag and drop prompt div
        hideDndBoxCount: '='
      },
      restrict: 'E',
      replace: true,
      controller: 'formBuilderDnd',
      templateUrl: 'formio/formbuilder/row.html'
    };
  }
];

},{}],48:[function(_dereq_,module,exports){
"use strict";
/**
 * A directive for a table builder
 */
module.exports = function() {
  return {
    restrict: 'E',
    replace: true,
    template: function() {
      return '<div class="form-builder-table">' +
        '  <div class="form-group">' +
        '    <label for="label">Number of Rows</label>' +
        '    <input type="number" class="form-control" id="numRows" name="numRows" placeholder="Number of Rows" ng-model="component.numRows">' +
        '  </div>' +
        '  <div class="form-group">' +
        '    <label for="label">Number of Columns</label>' +
        '    <input type="number" class="form-control" id="numCols" name="numCols" placeholder="Number of Columns" ng-model="component.numCols">' +
        '  </div>' +
        '</div>';
    },
    controller: [
      '$scope',
      function($scope) {
        $scope.builder = true;
        var changeTable = function() {
          /*eslint-disable max-depth */
          if ($scope.component.numRows && $scope.component.numCols) {
            var tmpTable = [];
            $scope.component.rows.splice($scope.component.numRows);
            for (var row = 0; row < $scope.component.numRows; row++) {
              if ($scope.component.rows[row]) {
                $scope.component.rows[row].splice($scope.component.numCols);
              }
              for (var col = 0; col < $scope.component.numCols; col++) {
                if (!tmpTable[row]) {
                  tmpTable[row] = [];
                }
                tmpTable[row][col] = {components:[]};
              }
            }
            $scope.component.rows = _.merge(tmpTable, $scope.component.rows);
            /*eslint-enable max-depth */
          }
        };

        $scope.$watch('component.numRows', changeTable);
        $scope.$watch('component.numCols', changeTable);
      }
    ]
  };
};

},{}],49:[function(_dereq_,module,exports){
"use strict";
/**
* Invokes Bootstrap's popover jquery plugin on an element
* Tooltip text can be provided via title attribute or
* as the value for this directive.
*/
module.exports = function() {
  return {
    restrict: 'A',
    replace: false,
    link: function($scope, el, attrs) {
      if (attrs.formBuilderTooltip || attrs.title) {
        var tooltip = angular.element('<i class="glyphicon glyphicon-question-sign text-muted"></i>');
        tooltip.popover({
          html: true,
          trigger: 'manual',
          placement: 'right',
          content: attrs.title || attrs.formBuilderTooltip
        }).on('mouseenter', function() {
          var $self = angular.element(this);
          $self.popover('show');
          $self.siblings('.popover').on('mouseleave', function() {
            $self.popover('hide');
          });
        }).on('mouseleave', function() {
          var $self = angular.element(this);
          setTimeout(function() {
            if (!angular.element('.popover:hover').length) {
              $self.popover('hide');
            }
          }, 100);
        });
        el.append(' ').append(tooltip);
      }
    }
  };
};

},{}],50:[function(_dereq_,module,exports){
"use strict";
module.exports = function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      ctrl.$parsers.push(function(input) {
        try {
          var obj = JSON.parse(input);
          ctrl.$setValidity('jsonInput', true);
          return obj;
        }
        catch (e) {
          ctrl.$setValidity('jsonInput', false);
          return undefined;
        }
      });
      ctrl.$formatters.push(function(data) {
        if (data === null) {
          ctrl.$setValidity('jsonInput', false);
          return '';
        }
        try {
          var str = angular.toJson(data, true);
          ctrl.$setValidity('jsonInput', true);
          return str;
        }
        catch (e) {
          ctrl.$setValidity('jsonInput', false);
          return '';
        }
      });
    }
  };
};

},{}],51:[function(_dereq_,module,exports){
"use strict";
/*
* Prevents user inputting invalid api key characters.
* Valid characters for an api key are alphanumeric and hyphens
*/
module.exports = function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      var invalidRegex = /^[^A-Za-z]+|[^A-Za-z0-9\-\.]+/g;
      ngModel.$parsers.push(function(inputValue) {
        var transformedInput = inputValue.replace(invalidRegex, '');
        if (transformedInput !== inputValue) {
          ngModel.$setViewValue(transformedInput);
          ngModel.$render();
        }
        return transformedInput;
     });
    }
  };
};

},{}],52:[function(_dereq_,module,exports){
"use strict";
/**
* A directive that provides a UI to add {value, label} objects to an array.
*/
module.exports = function() {
  return {
    scope: {
      data: '=',
      label: '@',
      tooltipText: '@',
      valueLabel: '@',
      labelLabel: '@',
      valueProperty: '@',
      labelProperty: '@'
    },
    restrict: 'E',
    template: '<div class="form-group">' +
                '<label form-builder-tooltip="{{ tooltipText }}">{{ label }}</label>' +
                '<table class="table table-condensed">' +
                  '<thead>' +
                    '<tr>' +
                      '<th class="col-xs-6">{{ labelLabel }}</th>' +
                      '<th class="col-xs-4">{{ valueLabel }}</th>' +
                      '<th class="col-xs-2"></th>' +
                    '</tr>' +
                  '</thead>' +
                  '<tbody>' +
                    '<tr ng-repeat="v in data track by $index">' +
                      '<td class="col-xs-6"><input type="text" class="form-control" ng-model="v[labelProperty]" placeholder="{{ labelLabel }}"/></td>' +
                      '<td class="col-xs-4"><input type="text" class="form-control" ng-model="v[valueProperty]" placeholder="{{ valueLabel }}"/></td>' +
                      '<td class="col-xs-2"><button type="button" class="btn btn-danger btn-xs" ng-click="removeValue($index)" tabindex="-1"><span class="glyphicon glyphicon-remove-circle"></span></button></td>' +
                    '</tr>' +
                  '</tbody>' +
                '</table>' +
                '<button type="button" class="btn" ng-click="addValue()">Add {{ valueLabel }}</button>' +
              '</div>',
    replace: true,
    link: function($scope, el, attrs) {
      $scope.valueProperty = $scope.valueProperty || 'value';
      $scope.labelProperty = $scope.labelProperty || 'label';
      $scope.valueLabel = $scope.valueLabel || 'Value';
      $scope.labelLabel = $scope.labelLabel || 'Label';

      $scope.addValue = function() {
        var obj = {};
        obj[$scope.valueProperty] = '';
        obj[$scope.labelProperty] = '';
        $scope.data.push(obj);
      };

      $scope.removeValue = function(index) {
        $scope.data.splice(index, 1);
      };

      if ($scope.data.length === 0) {
        $scope.addValue();
      }

      if (!attrs.noAutocompleteValue) {
        $scope.$watch('data', function(newValue, oldValue) {
          // Ignore array addition/deletion changes
          if (newValue.length !== oldValue.length) {
            return;
          }

          _.map(newValue, function(entry, i) {
            if (entry[$scope.labelProperty] !== oldValue[i][$scope.labelProperty]) {// label changed
              if (entry[$scope.valueProperty] === '' || entry[$scope.valueProperty] === _.camelCase(oldValue[i][$scope.labelProperty])) {
                entry[$scope.valueProperty] = _.camelCase(entry[$scope.labelProperty]);
              }
            }
          });
        }, true);
      }
    }
  };
};

},{}],53:[function(_dereq_,module,exports){
"use strict";
// Create an AngularJS service called debounce
module.exports = ['$timeout','$q', function($timeout, $q) {
  // The service is actually this function, which we call with the func
  // that should be debounced and how long to wait in between calls
  return function debounce(func, wait, immediate) {
    var timeout;
    // Create a deferred object that will be resolved when we need to
    // actually call the func
    var deferred = $q.defer();
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }
      };
      var callNow = immediate && !timeout;
      if ( timeout ) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait);
      if (callNow) {
        deferred.resolve(func.apply(context,args));
        deferred = $q.defer();
      }
      return deferred.promise;
    };
  };
}];

},{}],54:[function(_dereq_,module,exports){
"use strict";
/*! ng-formio-builder v2.8.1 | https://unpkg.com/ng-formio-builder@2.8.1/LICENSE.txt */
/*global window: false, console: false */
/*jshint browser: true */


var app = angular.module('ngFormBuilder', [
  'formio',
  'dndLists',
  'ngDialog',
  'ui.bootstrap.accordion',
  'ngCkeditor'
]);

app.constant('FORM_OPTIONS', _dereq_('./constants/formOptions'));

app.constant('COMMON_OPTIONS', _dereq_('./constants/commonOptions'));

app.factory('debounce', _dereq_('./factories/debounce'));

app.directive('formBuilder', _dereq_('./directives/formBuilder'));

app.directive('formBuilderComponent', _dereq_('./directives/formBuilderComponent'));

app.directive('formBuilderElement', _dereq_('./directives/formBuilderElement'));

app.controller('formBuilderDnd', _dereq_('./directives/formBuilderDnd'));

app.directive('formBuilderList', _dereq_('./directives/formBuilderList'));

app.directive('formBuilderRow', _dereq_('./directives/formBuilderRow'));

app.directive('jsonInput', _dereq_('./directives/jsonInput'));

app.directive('formBuilderOption', _dereq_('./directives/formBuilderOption'));

app.directive('formBuilderTable', _dereq_('./directives/formBuilderTable'));

app.directive('formBuilderOptionKey', _dereq_('./directives/formBuilderOptionKey'));

app.directive('formBuilderOptionTags', _dereq_('./directives/formBuilderOptionTags'));

app.directive('validApiKey', _dereq_('./directives/validApiKey'));

app.directive('formBuilderOptionCustomValidation', _dereq_('./directives/formBuilderOptionCustomValidation'));

app.directive('formBuilderTooltip', _dereq_('./directives/formBuilderTooltip'));

app.directive('valueBuilder', _dereq_('./directives/valueBuilder'));

app.directive('formBuilderConditional', _dereq_('./directives/formBuilderConditional'));

/**
 * This workaround handles the fact that iframes capture mouse drag
 * events. This interferes with dragging over components like the
 * Content component. As a workaround, we keep track of the isDragging
 * flag here to overlay iframes with a div while dragging.
 */
app.value('dndDragIframeWorkaround', {
  isDragging: false
});

app.run([
  '$templateCache',
  '$rootScope',
  'ngDialog',
  function($templateCache, $rootScope, ngDialog) {
    // Close all open dialogs on state change.
    $rootScope.$on('$stateChangeStart', function() {
      ngDialog.closeAll(false);
    });

    $templateCache.put('formio/formbuilder/editbuttons.html',
      "<div class=\"component-btn-group\">\n  <div class=\"btn btn-xxs btn-danger component-settings-button\" style=\"z-index: 1000\" ng-click=\"removeComponent(component, formComponent.confirmRemove)\"><span class=\"glyphicon glyphicon-remove\"></span></div>\n  <div ng-if=\"::!hideMoveButton\" class=\"btn btn-xxs btn-default component-settings-button\" style=\"z-index: 1000\"><span class=\"glyphicon glyphicon glyphicon-move\"></span></div>\n  <div ng-if=\"::formComponent.views\" class=\"btn btn-xxs btn-default component-settings-button\" style=\"z-index: 1000\" ng-click=\"editComponent(component)\"><span class=\"glyphicon glyphicon-cog\"></span></div>\n</div>\n"
    );

    $templateCache.put('formio/formbuilder/component.html',
      "<div class=\"component-form-group component-type-{{ component.type }} form-builder-component\">\n  <div ng-if=\"::!hideButtons\" ng-include=\"'formio/formbuilder/editbuttons.html'\"></div>\n  <div class=\"form-group has-feedback form-field-type-{{ component.type }} {{component.customClass}}\" id=\"form-group-{{ component.key }}\" style=\"position:inherit\" ng-style=\"component.style\">\n    <form-builder-element></form-builder-element>\n  </div>\n</div>\n"
    );

    $templateCache.put('formio/formbuilder/list.html',
      "<ul class=\"component-list\"\n    dnd-list=\"component.components\"\n    dnd-drop=\"addComponent(item, index)\">\n  <li ng-if=\"component.components.length < hideCount\">\n    <div class=\"alert alert-info\" style=\"text-align:center; margin-bottom: 5px;\" role=\"alert\">\n      Drag and Drop a form component\n    </div>\n  </li>\n  <!-- DO NOT PUT \"track by $index\" HERE SINCE DYNAMICALLY ADDING/REMOVING COMPONENTS WILL BREAK -->\n  <li ng-repeat=\"component in component.components\"\n      ng-if=\"!rootList || !form.display || (form.display === 'form') || (form.page === $index)\"\n      dnd-draggable=\"component\"\n      dnd-effect-allowed=\"move\"\n      dnd-dragstart=\"dndDragIframeWorkaround.isDragging = true\"\n      dnd-dragend=\"dndDragIframeWorkaround.isDragging = false\"\n      dnd-moved=\"removeComponent(component, false)\">\n    <form-builder-component ng-if=\"!component.hideBuilder\"></form-builder-component>\n    <div ng-if=\"dndDragIframeWorkaround.isDragging && !formComponent.noDndOverlay\" class=\"dndOverlay\"></div>\n  </li>\n</ul>\n"
    );

    $templateCache.put('formio/formbuilder/row.html',
      "<div class=\"formbuilder-row\">\n  <label ng-if=\"component.label\" class=\"control-label\">{{ component.label }}</label>\n  <ul class=\"component-row formbuilder-group\"\n      dnd-list=\"component.components\"\n      dnd-drop=\"addComponent(item, index)\"\n      dnd-horizontal-list=\"true\">\n    <li ng-repeat=\"component in component.components\"\n        class=\"formbuilder-group-row pull-left\"\n        dnd-draggable=\"component\"\n        dnd-effect-allowed=\"move\"\n        dnd-dragstart=\"dndDragIframeWorkaround.isDragging = true\"\n        dnd-dragend=\"dndDragIframeWorkaround.isDragging = false\"\n        dnd-moved=\"removeComponent(component, false)\">\n      <form-builder-component></form-builder-component>\n      <div ng-if=\"dndDragIframeWorkaround.isDragging && !formComponent.noDndOverlay\" class=\"dndOverlay\"></div>\n    </li>\n    <li class=\"formbuilder-group-row form-builder-drop\" ng-if=\"component.components.length < hideCount\">\n      <div class=\"alert alert-info\" role=\"alert\">\n        Drag and Drop a form component\n      </div>\n    </li>\n  </ul>\n  <div style=\"clear:both;\"></div>\n</div>\n"
    );

    $templateCache.put('formio/formbuilder/builder.html',
      "<div class=\"row formbuilder\">\n  <div class=\"col-xs-4 col-sm-3 col-md-2 formcomponents\">\n    <uib-accordion close-others=\"true\">\n      <div uib-accordion-group ng-repeat=\"(groupName, group) in formComponentGroups\" heading=\"{{ group.title }}\" is-open=\"$first\" class=\"panel panel-default form-builder-panel {{ group.panelClass }}\">\n        <uib-accordion close-others=\"true\" ng-if=\"group.subgroups\">\n          <div uib-accordion-group ng-repeat=\"(subgroupName, subgroup) in group.subgroups\" heading=\"{{ subgroup.title }}\" is-open=\"$first\" class=\"panel panel-default form-builder-panel subgroup-accordion\">\n            <div ng-repeat=\"component in formComponentsByGroup[groupName][subgroupName]\" ng-if=\"component.title\"\n                dnd-draggable=\"component.settings\"\n                dnd-dragstart=\"dndDragIframeWorkaround.isDragging = true\"\n                dnd-dragend=\"dndDragIframeWorkaround.isDragging = false\"\n                dnd-effect-allowed=\"copy\"\n                class=\"formcomponentcontainer\">\n              <span class=\"btn btn-primary btn-xs btn-block formcomponent\" title=\"{{component.title}}\" style=\"overflow: hidden; text-overflow: ellipsis;\">\n                <i ng-if=\"component.icon\" class=\"{{ component.icon }}\"></i> {{ component.title }}\n              </span>\n            </div>\n          </div>\n        </uib-accordion>\n        <div ng-repeat=\"component in formComponentsByGroup[groupName]\" ng-if=\"!group.subgroup && component.title\"\n            dnd-draggable=\"component.settings\"\n            dnd-dragstart=\"dndDragIframeWorkaround.isDragging = true\"\n            dnd-dragend=\"dndDragIframeWorkaround.isDragging = false\"\n            dnd-effect-allowed=\"copy\"\n            class=\"formcomponentcontainer\">\n          <span class=\"btn btn-primary btn-xs btn-block formcomponent\" title=\"{{component.title}}\" style=\"overflow: hidden; text-overflow: ellipsis;\">\n            <i ng-if=\"component.icon\" class=\"{{ component.icon }}\"></i> {{ component.title }}\n          </span>\n        </div>\n      </div>\n    </uib-accordion>\n  </div>\n  <div class=\"col-xs-8 col-sm-9 col-md-10 formarea\">\n    <ol class=\"breadcrumb\" ng-if=\"form.display === 'wizard'\">\n      <li ng-repeat=\"title in pages() track by $index\"><a class=\"label\" style=\"font-size:1em;\" ng-class=\"{'label-info': ($index === form.page), 'label-primary': ($index !== form.page)}\" ng-click=\"showPage($index)\">{{ title }}</a></li>\n      <li><a class=\"label label-success\" style=\"font-size:1em;\" ng-click=\"newPage()\" data-toggle=\"tooltip\" title=\"Create Page\"><span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> page</a></li>\n    </ol>\n    <div class=\"dropzone\">\n      <form-builder-list component=\"form\" form=\"form\" formio=\"::formio\" hide-dnd-box-count=\"hideCount\" root-list=\"true\" class=\"rootlist\"></form-builder-list>\n    </div>\n  </div>\n</div>\n"
    );

    $templateCache.put('formio/formbuilder/datagrid.html',
      "<div class=\"datagrid-dnd dropzone\" ng-controller=\"formBuilderDnd\">\n  <label ng-if=\"component.label\" class=\"control-label\">{{ component.label }}</label>\n  <table class=\"table datagrid-table\" ng-class=\"{'table-striped': component.striped, 'table-bordered': component.bordered, 'table-hover': component.hover, 'table-condensed': component.condensed}\">\n    <tr>\n      <th style=\"padding:30px 0 10px 0\" ng-repeat=\"component in component.components\" ng-class=\"{'field-required': component.validate.required}\">\n        {{ (component.label || '') | formioTranslate:null:builder }}\n        <div ng-if=\"dndDragIframeWorkaround.isDragging && !formComponent.noDndOverlay\" class=\"dndOverlay\"></div>\n      </th>\n    </tr>\n    <tr\n      class=\"component-list\"\n      dnd-list=\"component.components\"\n      dnd-drop=\"addComponent(item, index)\"\n    >\n      <td\n        ng-repeat=\"component in component.components\"\n        ng-init=\"hideMoveButton = true; component.hideLabel = true\"\n        dnd-draggable=\"component\"\n        dnd-effect-allowed=\"move\"\n        dnd-dragstart=\"dndDragIframeWorkaround.isDragging = true\"\n        dnd-dragend=\"dndDragIframeWorkaround.isDragging = false\"\n        dnd-moved=\"removeComponent(component, false)\"\n      >\n        <div class=\"component-form-group component-type-{{ component.type }} form-builder-component\">\n          <div class=\"has-feedback form-field-type-{{ component.type }} {{component.customClass}}\" id=\"form-group-{{ component.key }}\" style=\"position:inherit\" ng-style=\"component.style\">\n            <div class=\"input-group\">\n              <form-builder-component></form-builder-component>\n            </div>\n          </div>\n        </div>\n      </td>\n      <td ng-if=\"component.components.length === 0\">\n        <div class=\"alert alert-info\" role=\"alert\">\n          Datagrid Components\n        </div>\n      </td>\n    </tr>\n  </table>\n  <div style=\"clear:both;\"></div>\n</div>\n"
    );

    $templateCache.put('formio/components/confirm-remove.html',
      "<form id=\"confirm-remove-dialog\">\n  <p>Removing this component will also <strong>remove all of its children</strong>! Are you sure you want to do this?</p>\n  <div>\n    <div class=\"form-group\">\n      <button type=\"submit\" class=\"btn btn-danger pull-right\" ng-click=\"closeThisDialog(true)\">Remove</button>&nbsp;\n      <button type=\"button\" class=\"btn btn-default pull-right\" style=\"margin-right: 5px;\" ng-click=\"closeThisDialog(false)\">Cancel</button>&nbsp;\n    </div>\n  </div>\n</form>\n"
    );
  }
]);

_dereq_('./components');

},{"./components":19,"./constants/commonOptions":35,"./constants/formOptions":36,"./directives/formBuilder":37,"./directives/formBuilderComponent":38,"./directives/formBuilderConditional":39,"./directives/formBuilderDnd":40,"./directives/formBuilderElement":41,"./directives/formBuilderList":42,"./directives/formBuilderOption":43,"./directives/formBuilderOptionCustomValidation":44,"./directives/formBuilderOptionKey":45,"./directives/formBuilderOptionTags":46,"./directives/formBuilderRow":47,"./directives/formBuilderTable":48,"./directives/formBuilderTooltip":49,"./directives/jsonInput":50,"./directives/validApiKey":51,"./directives/valueBuilder":52,"./factories/debounce":53}]},{},[54])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZm9ybWlvLXV0aWxzL3NyYy9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL2FkZHJlc3MuanMiLCJzcmMvY29tcG9uZW50cy9idXR0b24uanMiLCJzcmMvY29tcG9uZW50cy9jaGVja2JveC5qcyIsInNyYy9jb21wb25lbnRzL2NvbHVtbnMuanMiLCJzcmMvY29tcG9uZW50cy9jb21wb25lbnRzLmpzIiwic3JjL2NvbXBvbmVudHMvY29udGFpbmVyLmpzIiwic3JjL2NvbXBvbmVudHMvY29udGVudC5qcyIsInNyYy9jb21wb25lbnRzL2N1cnJlbmN5LmpzIiwic3JjL2NvbXBvbmVudHMvY3VzdG9tLmpzIiwic3JjL2NvbXBvbmVudHMvZGF0YWdyaWQuanMiLCJzcmMvY29tcG9uZW50cy9kYXRldGltZS5qcyIsInNyYy9jb21wb25lbnRzL2RheS5qcyIsInNyYy9jb21wb25lbnRzL2VtYWlsLmpzIiwic3JjL2NvbXBvbmVudHMvZmllbGRzZXQuanMiLCJzcmMvY29tcG9uZW50cy9maWxlLmpzIiwic3JjL2NvbXBvbmVudHMvaGlkZGVuLmpzIiwic3JjL2NvbXBvbmVudHMvaHRtbGVsZW1lbnQuanMiLCJzcmMvY29tcG9uZW50cy9pbmRleC5qcyIsInNyYy9jb21wb25lbnRzL251bWJlci5qcyIsInNyYy9jb21wb25lbnRzL3BhZ2UuanMiLCJzcmMvY29tcG9uZW50cy9wYW5lbC5qcyIsInNyYy9jb21wb25lbnRzL3Bhc3N3b3JkLmpzIiwic3JjL2NvbXBvbmVudHMvcGhvbmVudW1iZXIuanMiLCJzcmMvY29tcG9uZW50cy9yYWRpby5qcyIsInNyYy9jb21wb25lbnRzL3Jlc291cmNlLmpzIiwic3JjL2NvbXBvbmVudHMvc2VsZWN0LmpzIiwic3JjL2NvbXBvbmVudHMvc2VsZWN0Ym94ZXMuanMiLCJzcmMvY29tcG9uZW50cy9zaWduYXR1cmUuanMiLCJzcmMvY29tcG9uZW50cy9zdXJ2ZXkuanMiLCJzcmMvY29tcG9uZW50cy90YWJsZS5qcyIsInNyYy9jb21wb25lbnRzL3RleHRhcmVhLmpzIiwic3JjL2NvbXBvbmVudHMvdGV4dGZpZWxkLmpzIiwic3JjL2NvbXBvbmVudHMvd2VsbC5qcyIsInNyYy9jb25zdGFudHMvY29tbW9uT3B0aW9ucy5qcyIsInNyYy9jb25zdGFudHMvZm9ybU9wdGlvbnMuanMiLCJzcmMvZGlyZWN0aXZlcy9mb3JtQnVpbGRlci5qcyIsInNyYy9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyQ29tcG9uZW50LmpzIiwic3JjL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJDb25kaXRpb25hbC5qcyIsInNyYy9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyRG5kLmpzIiwic3JjL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJFbGVtZW50LmpzIiwic3JjL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJMaXN0LmpzIiwic3JjL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJPcHRpb24uanMiLCJzcmMvZGlyZWN0aXZlcy9mb3JtQnVpbGRlck9wdGlvbkN1c3RvbVZhbGlkYXRpb24uanMiLCJzcmMvZGlyZWN0aXZlcy9mb3JtQnVpbGRlck9wdGlvbktleS5qcyIsInNyYy9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyT3B0aW9uVGFncy5qcyIsInNyYy9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyUm93LmpzIiwic3JjL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJUYWJsZS5qcyIsInNyYy9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyVG9vbHRpcC5qcyIsInNyYy9kaXJlY3RpdmVzL2pzb25JbnB1dC5qcyIsInNyYy9kaXJlY3RpdmVzL3ZhbGlkQXBpS2V5LmpzIiwic3JjL2RpcmVjdGl2ZXMvdmFsdWVCdWlsZGVyLmpzIiwic3JjL2ZhY3Rvcmllcy9kZWJvdW5jZS5qcyIsInNyYy9uZ0Zvcm1CdWlsZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgYSBjb21wb25lbnQgaXMgYSBsYXlvdXQgY29tcG9uZW50IG9yIG5vdC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudFxuICAgKiAgIFRoZSBjb21wb25lbnQgdG8gY2hlY2suXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiAgIFdoZXRoZXIgb3Igbm90IHRoZSBjb21wb25lbnQgaXMgYSBsYXlvdXQgY29tcG9uZW50LlxuICAgKi9cbiAgaXNMYXlvdXRDb21wb25lbnQ6IGZ1bmN0aW9uIGlzTGF5b3V0Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgIHJldHVybiAoXG4gICAgICAoY29tcG9uZW50LmNvbHVtbnMgJiYgQXJyYXkuaXNBcnJheShjb21wb25lbnQuY29sdW1ucykpIHx8XG4gICAgICAoY29tcG9uZW50LnJvd3MgJiYgQXJyYXkuaXNBcnJheShjb21wb25lbnQucm93cykpIHx8XG4gICAgICAoY29tcG9uZW50LmNvbXBvbmVudHMgJiYgQXJyYXkuaXNBcnJheShjb21wb25lbnQuY29tcG9uZW50cykpXG4gICAgKSA/IHRydWUgOiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogSXRlcmF0ZSB0aHJvdWdoIGVhY2ggY29tcG9uZW50IHdpdGhpbiBhIGZvcm0uXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnRzXG4gICAqICAgVGhlIGNvbXBvbmVudHMgdG8gaXRlcmF0ZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogICBUaGUgaXRlcmF0aW9uIGZ1bmN0aW9uIHRvIGludm9rZSBmb3IgZWFjaCBjb21wb25lbnQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZUFsbFxuICAgKiAgIFdoZXRoZXIgb3Igbm90IHRvIGluY2x1ZGUgbGF5b3V0IGNvbXBvbmVudHMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqICAgVGhlIGN1cnJlbnQgZGF0YSBwYXRoIG9mIHRoZSBlbGVtZW50LiBFeGFtcGxlOiBkYXRhLnVzZXIuZmlyc3ROYW1lXG4gICAqL1xuICBlYWNoQ29tcG9uZW50OiBmdW5jdGlvbiBlYWNoQ29tcG9uZW50KGNvbXBvbmVudHMsIGZuLCBpbmNsdWRlQWxsLCBwYXRoKSB7XG4gICAgaWYgKCFjb21wb25lbnRzKSByZXR1cm47XG4gICAgcGF0aCA9IHBhdGggfHwgJyc7XG4gICAgY29tcG9uZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgdmFyIGhhc0NvbHVtbnMgPSBjb21wb25lbnQuY29sdW1ucyAmJiBBcnJheS5pc0FycmF5KGNvbXBvbmVudC5jb2x1bW5zKTtcbiAgICAgIHZhciBoYXNSb3dzID0gY29tcG9uZW50LnJvd3MgJiYgQXJyYXkuaXNBcnJheShjb21wb25lbnQucm93cyk7XG4gICAgICB2YXIgaGFzQ29tcHMgPSBjb21wb25lbnQuY29tcG9uZW50cyAmJiBBcnJheS5pc0FycmF5KGNvbXBvbmVudC5jb21wb25lbnRzKTtcbiAgICAgIHZhciBub1JlY3Vyc2UgPSBmYWxzZTtcbiAgICAgIHZhciBuZXdQYXRoID0gY29tcG9uZW50LmtleSA/IChwYXRoID8gKHBhdGggKyAnLicgKyBjb21wb25lbnQua2V5KSA6IGNvbXBvbmVudC5rZXkpIDogJyc7XG5cbiAgICAgIGlmIChpbmNsdWRlQWxsIHx8IGNvbXBvbmVudC50cmVlIHx8ICghaGFzQ29sdW1ucyAmJiAhaGFzUm93cyAmJiAhaGFzQ29tcHMpKSB7XG4gICAgICAgIG5vUmVjdXJzZSA9IGZuKGNvbXBvbmVudCwgbmV3UGF0aCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdWJQYXRoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChjb21wb25lbnQua2V5ICYmICgoY29tcG9uZW50LnR5cGUgPT09ICdkYXRhZ3JpZCcpIHx8IChjb21wb25lbnQudHlwZSA9PT0gJ2NvbnRhaW5lcicpKSkge1xuICAgICAgICAgIHJldHVybiBuZXdQYXRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgfTtcblxuICAgICAgaWYgKCFub1JlY3Vyc2UpIHtcbiAgICAgICAgaWYgKGhhc0NvbHVtbnMpIHtcbiAgICAgICAgICBjb21wb25lbnQuY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgICAgZWFjaENvbXBvbmVudChjb2x1bW4uY29tcG9uZW50cywgZm4sIGluY2x1ZGVBbGwsIHN1YlBhdGgoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIGlmIChoYXNSb3dzKSB7XG4gICAgICAgICAgW10uY29uY2F0LmFwcGx5KFtdLCBjb21wb25lbnQucm93cykuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICAgIGVhY2hDb21wb25lbnQocm93LmNvbXBvbmVudHMsIGZuLCBpbmNsdWRlQWxsLCBzdWJQYXRoKCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoaGFzQ29tcHMpIHtcbiAgICAgICAgICBlYWNoQ29tcG9uZW50KGNvbXBvbmVudC5jb21wb25lbnRzLCBmbiwgaW5jbHVkZUFsbCwgc3ViUGF0aCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgYSBjb21wb25lbnQgYnkgaXRzIGtleVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50c1xuICAgKiAgIFRoZSBjb21wb25lbnRzIHRvIGl0ZXJhdGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogICBUaGUga2V5IG9mIHRoZSBjb21wb25lbnQgdG8gZ2V0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKiAgIFRoZSBjb21wb25lbnQgdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBrZXksIG9yIHVuZGVmaW5lZCBpZiBub3QgZm91bmQuXG4gICAqL1xuICBnZXRDb21wb25lbnQ6IGZ1bmN0aW9uIGdldENvbXBvbmVudChjb21wb25lbnRzLCBrZXkpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIG1vZHVsZS5leHBvcnRzLmVhY2hDb21wb25lbnQoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICBpZiAoY29tcG9uZW50LmtleSA9PT0ga2V5KSB7XG4gICAgICAgIHJlc3VsdCA9IGNvbXBvbmVudDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBGbGF0dGVuIHRoZSBmb3JtIGNvbXBvbmVudHMgZm9yIGRhdGEgbWFuaXB1bGF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50c1xuICAgKiAgIFRoZSBjb21wb25lbnRzIHRvIGl0ZXJhdGUuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZUFsbFxuICAgKiAgIFdoZXRoZXIgb3Igbm90IHRvIGluY2x1ZGUgbGF5b3V0IGNvbXBvbmVudHMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqICAgVGhlIGZsYXR0ZW5lZCBjb21wb25lbnRzIG1hcC5cbiAgICovXG4gIGZsYXR0ZW5Db21wb25lbnRzOiBmdW5jdGlvbiBmbGF0dGVuQ29tcG9uZW50cyhjb21wb25lbnRzLCBpbmNsdWRlQWxsKSB7XG4gICAgdmFyIGZsYXR0ZW5lZCA9IHt9O1xuICAgIG1vZHVsZS5leHBvcnRzLmVhY2hDb21wb25lbnQoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50LCBwYXRoKSB7XG4gICAgICBmbGF0dGVuZWRbcGF0aF0gPSBjb21wb25lbnQ7XG4gICAgfSwgaW5jbHVkZUFsbCk7XG4gICAgcmV0dXJuIGZsYXR0ZW5lZDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSB2YWx1ZSBmb3IgYSBjb21wb25lbnQga2V5LCBpbiB0aGUgZ2l2ZW4gc3VibWlzc2lvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHN1Ym1pc3Npb25cbiAgICogICBBIHN1Ym1pc3Npb24gb2JqZWN0IHRvIHNlYXJjaC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiAgIEEgZm9yIGNvbXBvbmVudHMgQVBJIGtleSB0byBzZWFyY2ggZm9yLlxuICAgKi9cbiAgZ2V0VmFsdWU6IGZ1bmN0aW9uIGdldFZhbHVlKHN1Ym1pc3Npb24sIGtleSkge1xuICAgIHZhciBkYXRhID0gc3VibWlzc2lvbi5kYXRhIHx8IHt9O1xuXG4gICAgdmFyIHNlYXJjaCA9IGZ1bmN0aW9uIHNlYXJjaChkYXRhKSB7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdmFsdWUgPSBzZWFyY2goZGF0YVtpXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHJldHVybiBkYXRhW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YVtrZXlzW2ldXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHZhbHVlID0gc2VhcmNoKGRhdGFba2V5c1tpXV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gc2VhcmNoKGRhdGEpO1xuICB9XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcignYWRkcmVzcycsIHtcbiAgICAgICAgaWNvbjogJ2ZhIGZhLWhvbWUnLFxuICAgICAgICB2aWV3czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdEaXNwbGF5JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvYWRkcmVzcy9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2FkZHJlc3MvdmFsaWRhdGUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI2FkZHJlc3MnXG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuICBhcHAucnVuKFtcbiAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAvLyBDcmVhdGUgdGhlIHNldHRpbmdzIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvYWRkcmVzcy9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibGFiZWxcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGxhY2Vob2xkZXJcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidGFiaW5kZXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cIm1hcFJlZ2lvblwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIHJlZ2lvbiBiaWFzIHRvIHVzZSBmb3IgdGhpcyBzZWFyY2guIFNlZSA8YSBocmVmPVxcJ2h0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9nZW9jb2RpbmcvaW50cm8jUmVnaW9uQ29kZXNcXCcgdGFyZ2V0PVxcJ19ibGFua1xcJz5SZWdpb24gQmlhc2luZzwvYT4gZm9yIG1vcmUgaW5mb3JtYXRpb24uXCI+UmVnaW9uIEJpYXM8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJtYXBSZWdpb25cIiBuYW1lPVwibWFwUmVnaW9uXCIgbmctbW9kZWw9XCJjb21wb25lbnQubWFwLnJlZ2lvblwiIHBsYWNlaG9sZGVyPVwiRGFsbGFzXCIgLz4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cIm1hcEtleVwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIEFQSSBrZXkgZm9yIEdvb2dsZSBNYXBzLiBTZWUgPGEgaHJlZj1cXCdodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vZ2VvY29kaW5nL2dldC1hcGkta2V5XFwnIHRhcmdldD1cXCdfYmxhbmtcXCc+R2V0IGFuIEFQSSBLZXk8L2E+IGZvciBtb3JlIGluZm9ybWF0aW9uLlwiPkdvb2dsZSBNYXBzIEFQSSBLZXk8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJtYXBLZXlcIiBuYW1lPVwibWFwS2V5XCIgbmctbW9kZWw9XCJjb21wb25lbnQubWFwLmtleVwiIHBsYWNlaG9sZGVyPVwieHh4eHh4eHh4eHh4eHh4eHh4eC14eHh4eHh4eHh4eHh4eHh4eHh4XCIvPicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJtdWx0aXBsZVwiIGxhYmVsPVwiQWxsb3cgTXVsdGlwbGUgQWRkcmVzc2VzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2FkZHJlc3MvdmFsaWRhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5yZXF1aXJlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ1bmlxdWVcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhbXG4gICAgJ2Zvcm1pb0NvbXBvbmVudHNQcm92aWRlcicsXG4gICAgJ0ZPUk1fT1BUSU9OUycsXG4gICAgZnVuY3Rpb24oXG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIsXG4gICAgICBGT1JNX09QVElPTlNcbiAgICApIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcignYnV0dG9uJywge1xuICAgICAgICBvbkVkaXQ6IFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgJHNjb3BlLmFjdGlvbnMgPSBGT1JNX09QVElPTlMuYWN0aW9ucztcbiAgICAgICAgICAkc2NvcGUuc2l6ZXMgPSBGT1JNX09QVElPTlMuc2l6ZXM7XG4gICAgICAgICAgJHNjb3BlLnRoZW1lcyA9IEZPUk1fT1BUSU9OUy50aGVtZXM7XG4gICAgICAgIH1dLFxuICAgICAgICBpY29uOiAnZmEgZmEtc3RvcCcsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9idXR0b24vZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdMYXlvdXQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vbGF5b3V0Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jYnV0dG9uJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2J1dHRvbi9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibGFiZWxcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cImFjdGlvblwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhpcyBpcyB0aGUgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCBieSB0aGlzIGJ1dHRvbi5cIj5BY3Rpb248L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImFjdGlvblwiIG5hbWU9XCJhY3Rpb25cIiBuZy1vcHRpb25zPVwiYWN0aW9uLm5hbWUgYXMgYWN0aW9uLnRpdGxlIGZvciBhY3Rpb24gaW4gYWN0aW9uc1wiIG5nLW1vZGVsPVwiY29tcG9uZW50LmFjdGlvblwiPjwvc2VsZWN0PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIiBuZy1pZj1cImNvbXBvbmVudC5hY3Rpb24gPT09IFxcJ2V2ZW50XFwnXCI+JyArXG4gICAgICAgICAgJyAgPGxhYmVsIGZvcj1cImV2ZW50XCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgZXZlbnQgdG8gZmlyZSB3aGVuIHRoZSBidXR0b24gaXMgY2xpY2tlZC5cIj5CdXR0b24gRXZlbnQ8L2xhYmVsPicgK1xuICAgICAgICAgICcgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJldmVudFwiIG5hbWU9XCJldmVudFwiIG5nLW1vZGVsPVwiY29tcG9uZW50LmV2ZW50XCIgcGxhY2Vob2xkZXI9XCJldmVudFwiIC8+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJ0aGVtZVwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIGNvbG9yIHRoZW1lIG9mIHRoaXMgcGFuZWwuXCI+VGhlbWU8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInRoZW1lXCIgbmFtZT1cInRoZW1lXCIgbmctb3B0aW9ucz1cInRoZW1lLm5hbWUgYXMgdGhlbWUudGl0bGUgZm9yIHRoZW1lIGluIHRoZW1lc1wiIG5nLW1vZGVsPVwiY29tcG9uZW50LnRoZW1lXCI+PC9zZWxlY3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJzaXplXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgc2l6ZSBvZiB0aGlzIGJ1dHRvbi5cIj5TaXplPC9sYWJlbD4nICtcbiAgICAgICAgICAgICc8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJzaXplXCIgbmFtZT1cInNpemVcIiBuZy1vcHRpb25zPVwic2l6ZS5uYW1lIGFzIHNpemUudGl0bGUgZm9yIHNpemUgaW4gc2l6ZXNcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5zaXplXCI+PC9zZWxlY3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxlZnRJY29uXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInJpZ2h0SWNvblwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJjdXN0b21DbGFzc1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJpbmRleFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJibG9ja1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkaXNhYmxlT25JbnZhbGlkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdjaGVja2JveCcsIHtcbiAgICAgICAgaWNvbjogJ2ZhIGZhLWNoZWNrLXNxdWFyZScsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jaGVja2JveC9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9kYXRhLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NoZWNrYm94L3ZhbGlkYXRlLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0xheW91dCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9sYXlvdXQuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9jb25kaXRpb25hbC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ2h0dHA6Ly9oZWxwLmZvcm0uaW8vdXNlcmd1aWRlLyNjaGVja2JveCdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9jaGVja2JveC9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibGFiZWxcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZGF0YWdyaWRMYWJlbFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJjdXN0b21DbGFzc1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJpbmRleFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcm90ZWN0ZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGVyc2lzdGVudFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkaXNhYmxlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9jaGVja2JveC92YWxpZGF0ZS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLnJlcXVpcmVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdjb2x1bW5zJywge1xuICAgICAgICBmYnRlbXBsYXRlOiAnZm9ybWlvL2Zvcm1idWlsZGVyL2NvbHVtbnMuaHRtbCcsXG4gICAgICAgIGljb246ICdmYSBmYS1jb2x1bW5zJyxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ2h0dHA6Ly9oZWxwLmZvcm0uaW8vdXNlcmd1aWRlLyNjb2x1bW5zJyxcbiAgICAgICAgbm9EbmRPdmVybGF5OiB0cnVlLFxuICAgICAgICBjb25maXJtUmVtb3ZlOiB0cnVlLFxuICAgICAgICB2aWV3czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdEaXNwbGF5JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29sdW1ucy9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuICBhcHAucnVuKFtcbiAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9mb3JtYnVpbGRlci9jb2x1bW5zLmh0bWwnLFxuICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXhzLTYgY29tcG9uZW50LWZvcm0tZ3JvdXBcIiBuZy1yZXBlYXQ9XCJjb21wb25lbnQgaW4gY29tcG9uZW50LmNvbHVtbnNcIj4nICtcbiAgICAgICAgICAgICc8Zm9ybS1idWlsZGVyLWxpc3QgY2xhc3M9XCJmb3JtaW8tY29sdW1uXCIgY29tcG9uZW50PVwiY29tcG9uZW50XCIgZm9ybT1cImZvcm1cIiBmb3JtaW89XCI6OmZvcm1pb1wiPjwvZm9ybS1idWlsZGVyLWxpc3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgICAgKTtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvY29sdW1ucy9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBjb21wb25lbnQgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9zZXR0aW5ncy5odG1sJyxcbiAgICAgICAgJzxmb3JtIGlkPVwiY29tcG9uZW50LXNldHRpbmdzXCIgbm92YWxpZGF0ZT4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtbWQtNlwiPicgK1xuICAgICAgICAgICAgICAnPHAgY2xhc3M9XCJsZWFkXCIgbmctaWY9XCI6OmZvcm1Db21wb25lbnQudGl0bGVcIiBzdHlsZT1cIm1hcmdpbi10b3A6MTBweDtcIj57ezo6Zm9ybUNvbXBvbmVudC50aXRsZX19IENvbXBvbmVudDwvcD4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLW1kLTZcIj4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCI6OmZvcm1Db21wb25lbnQuZG9jdW1lbnRhdGlvblwiIHN0eWxlPVwibWFyZ2luLXRvcDoxMHB4OyBtYXJnaW4tcmlnaHQ6MjBweDtcIj4nICtcbiAgICAgICAgICAgICAgICAnPGEgbmctaHJlZj1cInt7IDo6Zm9ybUNvbXBvbmVudC5kb2N1bWVudGF0aW9uIH19XCIgdGFyZ2V0PVwiX2JsYW5rXCI+PGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLW5ldy13aW5kb3dcIj48L2k+IEhlbHAhPC9hPicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC14cy02XCI+JyArXG4gICAgICAgICAgICAgICc8dWliLXRhYnNldD4nICtcbiAgICAgICAgICAgICAgICAnPHVpYi10YWIgbmctcmVwZWF0PVwidmlldyBpbiA6OmZvcm1Db21wb25lbnQudmlld3NcIiBoZWFkaW5nPVwie3sgOjp2aWV3Lm5hbWUgfX1cIj48bmctaW5jbHVkZSBzcmM9XCI6OnZpZXcudGVtcGxhdGVcIj48L25nLWluY2x1ZGU+PC91aWItdGFiPicgK1xuICAgICAgICAgICAgICAnPC91aWItdGFic2V0PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wteHMtNlwiPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHQgcHJldmlldy1wYW5lbFwiIHN0eWxlPVwibWFyZ2luLXRvcDo0NHB4O1wiPicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPlByZXZpZXc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4nICtcbiAgICAgICAgICAgICAgICAgICc8Zm9ybWlvLWNvbXBvbmVudCBjb21wb25lbnQ9XCJjb21wb25lbnRcIiBkYXRhPVwie31cIiBmb3JtaW89XCI6OmZvcm1pb1wiPjwvZm9ybWlvLWNvbXBvbmVudD4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgJzxmb3JtaW8tc2V0dGluZ3MtaW5mbyBjb21wb25lbnQ9XCJjb21wb25lbnRcIiBkYXRhPVwie31cIiBmb3JtaW89XCI6OmZvcm1pb1wiPjwvZm9ybWlvLXNldHRpbmdzLWluZm8+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tc3VjY2Vzc1wiIG5nLWNsaWNrPVwiY2xvc2VUaGlzRGlhbG9nKHRydWUpXCI+U2F2ZTwvYnV0dG9uPiZuYnNwOycgK1xuICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwiY2xvc2VUaGlzRGlhbG9nKGZhbHNlKVwiIG5nLWlmPVwiIWNvbXBvbmVudC5pc05ld1wiPkNhbmNlbDwvYnV0dG9uPiZuYnNwOycgK1xuICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyXCIgbmctY2xpY2s9XCJyZW1vdmVDb21wb25lbnQoY29tcG9uZW50LCBmb3JtQ29tcG9uZW50c1tjb21wb25lbnQudHlwZV0uY29uZmlybVJlbW92ZSk7IGNsb3NlVGhpc0RpYWxvZyhmYWxzZSlcIj5SZW1vdmU8L2J1dHRvbj4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzwvZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIGNvbW1vbiBBUEkgdGFiIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2RhdGEuaHRtbCcsXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRlZmF1bHRWYWx1ZVwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzx1aWItYWNjb3JkaW9uPicgK1xuICAgICAgICAnICA8ZGl2IHVpYi1hY2NvcmRpb24tZ3JvdXAgaGVhZGluZz1cIkN1c3RvbSBEZWZhdWx0IFZhbHVlXCIgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCI+JyArXG4gICAgICAgICcgICAgPHRleHRhcmVhIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgcm93cz1cIjVcIiBpZD1cImN1c3RvbURlZmF1bHRWYWx1ZVwiIG5hbWU9XCJjdXN0b21EZWZhdWx0VmFsdWVcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5jdXN0b21EZWZhdWx0VmFsdWVcIiBwbGFjZWhvbGRlcj1cIi8qKiogRXhhbXBsZSBDb2RlICoqKi9cXG52YWx1ZSA9IGRhdGFbXFwnbXlrZXlcXCddICsgZGF0YVtcXCdhbm90aGVyS2V5XFwnXTtcIj48L3RleHRhcmVhPicgK1xuICAgICAgICAnICAgIDxzbWFsbD4nICtcbiAgICAgICAgJyAgICAgIDxwPkVudGVyIGN1c3RvbSBkZWZhdWx0IHZhbHVlIGNvZGUuPC9wPicgK1xuICAgICAgICAnICAgICAgPHA+WW91IG11c3QgYXNzaWduIHRoZSA8c3Ryb25nPnZhbHVlPC9zdHJvbmc+IHZhcmlhYmxlIGFzIHRoZSByZXN1bHQgeW91IHdhbnQgZm9yIHRoZSBkZWZhdWx0IHZhbHVlLjwvcD4nICtcbiAgICAgICAgJyAgICAgIDxwPlRoZSBnbG9iYWwgdmFyaWFibGUgPHN0cm9uZz5kYXRhPC9zdHJvbmc+IGlzIHByb3ZpZGVkLCBhbmQgYWxsb3dzIHlvdSB0byBhY2Nlc3MgdGhlIGRhdGEgb2YgYW55IGZvcm0gY29tcG9uZW50LCBieSB1c2luZyBpdHMgQVBJIGtleS48L3A+JyArXG4gICAgICAgICcgICAgICA8cD5EZWZhdWx0IFZhbHVlcyBhcmUgb25seSBjYWxjdWxhdGVkIG9uIGZvcm0gbG9hZC4gVXNlIENhbGN1bGF0ZWQgVmFsdWUgZm9yIGEgdmFsdWUgdGhhdCB3aWxsIHVwZGF0ZSB3aXRoIHRoZSBmb3JtLjwvcD4nICtcbiAgICAgICAgJyAgICA8L3NtYWxsPicgK1xuICAgICAgICAnICA8L2Rpdj4nICtcbiAgICAgICAgJyAgPGRpdiB1aWItYWNjb3JkaW9uLWdyb3VwIGhlYWRpbmc9XCJDYWxjdWxhdGVkIFZhbHVlXCIgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCI+JyArXG4gICAgICAgICcgICAgPHRleHRhcmVhIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgcm93cz1cIjVcIiBpZD1cImNhbGN1bGF0ZVZhbHVlXCIgbmFtZT1cImNhbGN1bGF0ZVZhbHVlXCIgbmctbW9kZWw9XCJjb21wb25lbnQuY2FsY3VsYXRlVmFsdWVcIiBwbGFjZWhvbGRlcj1cIi8qKiogRXhhbXBsZSBDb2RlICoqKi9cXG52YWx1ZSA9IGRhdGFbXFwnbXlrZXlcXCddICsgZGF0YVtcXCdhbm90aGVyS2V5XFwnXTtcIj48L3RleHRhcmVhPicgK1xuICAgICAgICAnICAgIDxzbWFsbD4nICtcbiAgICAgICAgJyAgICAgIDxwPkVudGVyIGNvZGUgdG8gY2FsY3VsYXRlIGEgdmFsdWUuPC9wPicgK1xuICAgICAgICAnICAgICAgPHA+WW91IG11c3QgYXNzaWduIHRoZSA8c3Ryb25nPnZhbHVlPC9zdHJvbmc+IHZhcmlhYmxlIGFzIHRoZSByZXN1bHQgeW91IHdhbnQgZm9yIHRoZSBkZWZhdWx0IHZhbHVlLjwvcD4nICtcbiAgICAgICAgJyAgICAgIDxwPlRoZSBnbG9iYWwgdmFyaWFibGUgPHN0cm9uZz5kYXRhPC9zdHJvbmc+IGlzIHByb3ZpZGVkLCBhbmQgYWxsb3dzIHlvdSB0byBhY2Nlc3MgdGhlIGRhdGEgb2YgYW55IGZvcm0gY29tcG9uZW50LCBieSB1c2luZyBpdHMgQVBJIGtleS48L3A+JyArXG4gICAgICAgICcgICAgPC9zbWFsbD4nICtcbiAgICAgICAgJyAgPC9kaXY+JyArXG4gICAgICAgICc8L3VpYi1hY2NvcmRpb24+J1xuICAgICAgKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBjb21tb24gQVBJIHRhYiBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24ta2V5PjwvZm9ybS1idWlsZGVyLW9wdGlvbi1rZXk+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uLXRhZ3M+PC9mb3JtLWJ1aWxkZXItb3B0aW9uLXRhZ3M+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBjb21tb24gTGF5b3V0IHRhYiBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9sYXlvdXQuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAvLyBOZWVkIHRvIHVzZSBhcnJheSBub3RhdGlvbiB0byBoYXZlIGRhc2ggaW4gbmFtZVxuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInN0eWxlW1xcJ21hcmdpbi10b3BcXCddXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInN0eWxlW1xcJ21hcmdpbi1yaWdodFxcJ11cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwic3R5bGVbXFwnbWFyZ2luLWJvdHRvbVxcJ11cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwic3R5bGVbXFwnbWFyZ2luLWxlZnRcXCddXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgY29tbW9uIExheW91dCB0YWIgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCcsXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLWNvbmRpdGlvbmFsPjwvZm9ybS1idWlsZGVyLWNvbmRpdGlvbmFsPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdjb250YWluZXInLCB7XG4gICAgICAgIGZidGVtcGxhdGU6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvY29udGFpbmVyLmh0bWwnLFxuICAgICAgICB2aWV3czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdEaXNwbGF5JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29udGFpbmVyL2Rpc3BsYXkuaHRtbCdcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI2NvbnRhaW5lcicsXG4gICAgICAgIG5vRG5kT3ZlcmxheTogdHJ1ZSxcbiAgICAgICAgY29uZmlybVJlbW92ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICBdKTtcblxuICBhcHAucnVuKFtcbiAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2NvbnRhaW5lci9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxhYmVsXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJjdXN0b21DbGFzc1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicHJvdGVjdGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vZm9ybWJ1aWxkZXIvY29udGFpbmVyLmh0bWwnLFxuICAgICAgICAnPGZpZWxkc2V0PicgK1xuICAgICAgICAnPGxhYmVsIG5nLWlmPVwiY29tcG9uZW50LmxhYmVsXCIgY2xhc3M9XCJjb250cm9sLWxhYmVsXCI+e3sgY29tcG9uZW50LmxhYmVsIH19PC9sYWJlbD4nICtcbiAgICAgICAgJzxmb3JtLWJ1aWxkZXItbGlzdCBjb21wb25lbnQ9XCJjb21wb25lbnRcIiBmb3JtPVwiZm9ybVwiIGZvcm1pbz1cIjo6Zm9ybWlvXCI+PC9mb3JtLWJ1aWxkZXItbGlzdD4nICtcbiAgICAgICAgJzwvZmllbGRzZXQ+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhbXG4gICAgJ2Zvcm1pb0NvbXBvbmVudHNQcm92aWRlcicsXG4gICAgZnVuY3Rpb24oZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyKSB7XG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIucmVnaXN0ZXIoJ2NvbnRlbnQnLCB7XG4gICAgICAgIGZidGVtcGxhdGU6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvY29udGVudC5odG1sJyxcbiAgICAgICAgaWNvbjogJ2ZhIGZhLWh0bWw1JyxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ2h0dHA6Ly9oZWxwLmZvcm0uaW8vdXNlcmd1aWRlLyNjb250ZW50LWNvbXBvbmVudCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHNldHRpbmdzLCAkc2NvcGUpIHtcbiAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdjb21wb25lbnQuaHRtbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdmb3JtQnVpbGRlcjp1cGRhdGUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuICBhcHAucnVuKFtcbiAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9mb3JtYnVpbGRlci9jb250ZW50Lmh0bWwnLFxuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAnPHRleHRhcmVhIGNrZWRpdG9yIG5nLW1vZGVsPVwiY29tcG9uZW50Lmh0bWxcIj48dGV4dGFyZWE+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgICApO1xuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdjdXJyZW5jeScsIHtcbiAgICAgICAgaWNvbjogJ2ZhIGZhLXVzZCcsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jdXJyZW5jeS9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2N1cnJlbmN5L3ZhbGlkYXRlLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0xheW91dCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9sYXlvdXQuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9jb25kaXRpb25hbC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ2h0dHA6Ly9oZWxwLmZvcm0uaW8vdXNlcmd1aWRlLyNjdXJyZW5jeSdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9jdXJyZW5jeS9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibGFiZWxcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGxhY2Vob2xkZXJcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZGVzY3JpcHRpb25cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicHJlZml4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInN1ZmZpeFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJjdXN0b21DbGFzc1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJpbmRleFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJtdWx0aXBsZVwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkaXNhYmxlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBBUEkgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9jdXJyZW5jeS92YWxpZGF0ZS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLnJlcXVpcmVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbi1jdXN0b20tdmFsaWRhdGlvbj48L2Zvcm0tYnVpbGRlci1vcHRpb24tY3VzdG9tLXZhbGlkYXRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhbXG4gICAgJ2Zvcm1pb0NvbXBvbmVudHNQcm92aWRlcicsXG4gICAgZnVuY3Rpb24oZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyKSB7XG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIucmVnaXN0ZXIoJ2N1c3RvbScsIHtcbiAgICAgICAgaWNvbjogJ2ZhIGZhLWN1YmVzJyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2N1c3RvbS9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jY3VzdG9tJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcblxuICBhcHAuY29udHJvbGxlcignY3VzdG9tQ29tcG9uZW50JywgW1xuICAgICckc2NvcGUnLFxuICAgICdmb3JtaW9Db21wb25lbnRzJyxcbiAgICBmdW5jdGlvbihcbiAgICAgICRzY29wZSxcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNcbiAgICApIHtcbiAgICAgIC8vIEJlY2F1c2Ugb2YgdGhlIHdlaXJkbmVzc2VzIG9mIHByb3RvdHlwZSBpbmhlcml0ZW5jZSwgY29tcG9uZW50cyBjYW4ndCB1cGRhdGUgdGhlbXNlbHZlcywgb25seSB0aGVpciBwcm9wZXJ0aWVzLlxuICAgICAgJHNjb3BlLiR3YXRjaCgnY29tcG9uZW50JywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICAgIC8vIERvbid0IGFsbG93IGEgdHlwZSBvZiBhIHJlYWwgdHlwZS5cbiAgICAgICAgICBuZXdWYWx1ZS50eXBlID0gKGZvcm1pb0NvbXBvbmVudHMuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eShuZXdWYWx1ZS50eXBlKSA/ICdjdXN0b20nIDogbmV3VmFsdWUudHlwZSk7XG4gICAgICAgICAgLy8gRW5zdXJlIHNvbWUga2V5IHNldHRpbmdzIGFyZSBzZXQuXG4gICAgICAgICAgbmV3VmFsdWUua2V5ID0gbmV3VmFsdWUua2V5IHx8IG5ld1ZhbHVlLnR5cGU7XG4gICAgICAgICAgbmV3VmFsdWUucHJvdGVjdGVkID0gKG5ld1ZhbHVlLmhhc093blByb3BlcnR5KCdwcm90ZWN0ZWQnKSA/IG5ld1ZhbHVlLnByb3RlY3RlZCA6IGZhbHNlKTtcbiAgICAgICAgICBuZXdWYWx1ZS5wZXJzaXN0ZW50ID0gKG5ld1ZhbHVlLmhhc093blByb3BlcnR5KCdwZXJzaXN0ZW50JykgPyBuZXdWYWx1ZS5wZXJzaXN0ZW50IDogdHJ1ZSk7XG4gICAgICAgICAgJHNjb3BlLnVwZGF0ZUNvbXBvbmVudChuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuXG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9jdXN0b20vZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgJzxwPkN1c3RvbSBjb21wb25lbnRzIGNhbiBiZSB1c2VkIHRvIHJlbmRlciBzcGVjaWFsIGZpZWxkcyBvciB3aWRnZXRzIGluc2lkZSB5b3VyIGFwcC4gRm9yIGluZm9ybWF0aW9uIG9uIGhvdyB0byBkaXNwbGF5IGluIGFuIGFwcCwgc2VlIDxhIGhyZWY9XCJodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jY3VzdG9tXCIgdGFyZ2V0PVwiX2JsYW5rXCI+Y3VzdG9tIGNvbXBvbmVudCBkb2N1bWVudGF0aW9uPC9hPi48L3A+JyArXG4gICAgICAgICc8bGFiZWwgZm9yPVwianNvblwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiRW50ZXIgdGhlIEpTT04gZm9yIHRoaXMgY3VzdG9tIGVsZW1lbnQuXCI+Q3VzdG9tIEVsZW1lbnQgSlNPTjwvbGFiZWw+JyArXG4gICAgICAgICc8dGV4dGFyZWEgbmctY29udHJvbGxlcj1cImN1c3RvbUNvbXBvbmVudFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJqc29uXCIgbmFtZT1cImpzb25cIiBqc29uLWlucHV0IG5nLW1vZGVsPVwiY29tcG9uZW50XCIgcGxhY2Vob2xkZXI9XCJ7fVwiIHJvd3M9XCIxMFwiPjwvdGV4dGFyZWE+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcignZGF0YWdyaWQnLCB7XG4gICAgICAgIGZidGVtcGxhdGU6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvZGF0YWdyaWQuaHRtbCcsXG4gICAgICAgIGljb246ICdmYSBmYS10aCcsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9kYXRhZ3JpZC9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI2RhdGFncmlkJyxcbiAgICAgICAgbm9EbmRPdmVybGF5OiB0cnVlLFxuICAgICAgICBjb25maXJtUmVtb3ZlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuXG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvZGF0YWdyaWQvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJsYWJlbFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiYWRkQW5vdGhlclwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInN0cmlwZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImJvcmRlcmVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJob3ZlclwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY29uZGVuc2VkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcm90ZWN0ZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInBlcnNpc3RlbnRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhbXG4gICAgJ2Zvcm1pb0NvbXBvbmVudHNQcm92aWRlcicsXG4gICAgZnVuY3Rpb24oZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyKSB7XG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIucmVnaXN0ZXIoJ2RhdGV0aW1lJywge1xuICAgICAgICBvbkVkaXQ6IFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgLy8gRk9SLTM0IC0gVXBkYXRlIDEyaHIgdGltZSBkaXNwbGF5IGluIHRoZSBmaWVsZCwgbm90IG9ubHkgdGltZSBwaWNrZXIuXG4gICAgICAgICAgJHNjb3BlLiR3YXRjaCgnY29tcG9uZW50LnRpbWVQaWNrZXIuc2hvd01lcmlkaWFuJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBfb2xkID0gdmFsdWUgPyAnSEgnIDogJ2hoJztcbiAgICAgICAgICAgIHZhciBfbmV3ID0gIXZhbHVlID8gJ0hIJyA6ICdoaCc7XG5cbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29tcG9uZW50LmVuYWJsZVRpbWUpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC5mb3JtYXQgPSAkc2NvcGUuY29tcG9uZW50LmZvcm1hdC50b1N0cmluZygpLnJlcGxhY2UoX29sZCwgX25ldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkc2NvcGUuc2V0Rm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbXBvbmVudC5lbmFibGVEYXRlICYmICRzY29wZS5jb21wb25lbnQuZW5hYmxlVGltZSkge1xuICAgICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LmZvcm1hdCA9ICd5eXl5LU1NLWRkIEhIOm1tJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCRzY29wZS5jb21wb25lbnQuZW5hYmxlRGF0ZSAmJiAhJHNjb3BlLmNvbXBvbmVudC5lbmFibGVUaW1lKSB7XG4gICAgICAgICAgICAgICRzY29wZS5jb21wb25lbnQuZm9ybWF0ID0gJ3l5eXktTU0tZGQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoISRzY29wZS5jb21wb25lbnQuZW5hYmxlRGF0ZSAmJiAkc2NvcGUuY29tcG9uZW50LmVuYWJsZVRpbWUpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC5mb3JtYXQgPSAnSEg6bW0nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgJHNjb3BlLnN0YXJ0aW5nRGF5cyA9IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXTtcbiAgICAgICAgICAkc2NvcGUubW9kZXMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6ICdkYXknLFxuICAgICAgICAgICAgICBsYWJlbDogJ0RheSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6ICdtb250aCcsXG4gICAgICAgICAgICAgIGxhYmVsOiAnTW9udGgnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiAneWVhcicsXG4gICAgICAgICAgICAgIGxhYmVsOiAnWWVhcidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdO1xuICAgICAgICB9XSxcbiAgICAgICAgaWNvbjogJ2ZhIGZhLWNsb2NrLW8nLFxuICAgICAgICB2aWV3czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdEaXNwbGF5JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvZGF0ZXRpbWUvZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0RhdGUnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9kYXRldGltZS9kYXRlLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVGltZScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2RhdGV0aW1lL3RpbWUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdWYWxpZGF0aW9uJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvZGF0ZXRpbWUvdmFsaWRhdGUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI2RhdGV0aW1lJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2RhdGV0aW1lL2Rpc3BsYXkuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJsYWJlbFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkZWZhdWx0RGF0ZVwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwbGFjZWhvbGRlclwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkZXNjcmlwdGlvblwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmb3JtYXRcIiBsYWJlbD1cIkRhdGUgRm9ybWF0XCIgcGxhY2Vob2xkZXI9XCJFbnRlciB0aGUgRGF0ZSBmb3JtYXRcIiB0aXRsZT1cIlRoZSBmb3JtYXQgZm9yIGRpc3BsYXlpbmcgdGhpcyBmaWVsZFxcJ3MgZGF0ZS4gVGhlIGZvcm1hdCBtdXN0IGJlIHNwZWNpZmllZCBsaWtlIHRoZSA8YSBocmVmPVxcJ2h0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9maWx0ZXIvZGF0ZVxcJyB0YXJnZXQ9XFwnX2JsYW5rXFwnPkFuZ3VsYXJKUyBkYXRlIGZpbHRlcjwvYT4uXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2RhdGV0aW1lL2RhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImNoZWNrYm94XCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcm0tYnVpbGRlci10b29sdGlwPVwiRW5hYmxlcyBkYXRlIGlucHV0IGZvciB0aGlzIGZpZWxkLlwiPicgK1xuICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwiZW5hYmxlRGF0ZVwiIG5hbWU9XCJlbmFibGVEYXRlXCIgbmctbW9kZWw9XCJjb21wb25lbnQuZW5hYmxlRGF0ZVwiIG5nLWNoZWNrZWQ9XCJjb21wb25lbnQuZW5hYmxlRGF0ZVwiIG5nLWNoYW5nZT1cInNldEZvcm1hdCgpXCI+IEVuYWJsZSBEYXRlIElucHV0JyArXG4gICAgICAgICAgICAnPC9sYWJlbD4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cImRhdGVwaWNrZXJNb2RlXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgaW5pdGlhbCB2aWV3IHRvIGRpc3BsYXkgd2hlbiBjbGlja2luZyBvbiB0aGlzIGZpZWxkLlwiPkluaXRpYWwgTW9kZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAnPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlck1vZGVcIiBuYW1lPVwiZGF0ZXBpY2tlck1vZGVcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5kYXRlcGlja2VyTW9kZVwiIG5nLW9wdGlvbnM9XCJtb2RlLm5hbWUgYXMgbW9kZS5sYWJlbCBmb3IgbW9kZSBpbiBtb2Rlc1wiPjwvc2VsZWN0PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGFiZWwgZm9yPVwicGxhY2Vob2xkZXJcIiBmb3JtLWJ1aWxkZXItdG9vbHRpcD1cIlRoZSBtaW5pbXVtIGRhdGUgdGhhdCBjYW4gYmUgcGlja2VkLlwiPk1pbmltdW0gRGF0ZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+JyArXG4gICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiICcgK1xuICAgICAgICAgICAgICAgICduZy1mb2N1cz1cIm1pbkRhdGVPcGVuID0gdHJ1ZVwiICcgK1xuICAgICAgICAgICAgICAgICduZy1pbml0PVwibWluRGF0ZU9wZW4gPSBmYWxzZVwiICcgK1xuICAgICAgICAgICAgICAgICdpcy1vcGVuPVwibWluRGF0ZU9wZW5cIiAnICtcbiAgICAgICAgICAgICAgICAnZGF0ZXRpbWUtcGlja2VyPVwieXl5eS1NTS1kZFwiICcgK1xuICAgICAgICAgICAgICAgICdlbmFibGUtdGltZT1cImZhbHNlXCIgJyArXG4gICAgICAgICAgICAgICAgJ25nLW1vZGVsPVwiY29tcG9uZW50Lm1pbkRhdGVcIiAvPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJpbnB1dC1ncm91cC1idG5cIj4nICtcbiAgICAgICAgICAgICAgICAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cIm1pbkRhdGVPcGVuID0gdHJ1ZVwiPjxpIGNsYXNzPVwiZmEgZmEtY2FsZW5kYXJcIj48L2k+PC9idXR0b24+JyArXG4gICAgICAgICAgICAgICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJwbGFjZWhvbGRlclwiICBmb3JtLWJ1aWxkZXItdG9vbHRpcD1cIlRoZSBtYXhpbXVtIGRhdGUgdGhhdCBjYW4gYmUgcGlja2VkLlwiPk1heGltdW0gRGF0ZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+JyArXG4gICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiICcgK1xuICAgICAgICAgICAgICAgICduZy1mb2N1cz1cIm1heERhdGVPcGVuID0gdHJ1ZVwiICcgK1xuICAgICAgICAgICAgICAgICduZy1pbml0PVwibWF4RGF0ZU9wZW4gPSBmYWxzZVwiICcgK1xuICAgICAgICAgICAgICAgICdpcy1vcGVuPVwibWF4RGF0ZU9wZW5cIiAnICtcbiAgICAgICAgICAgICAgICAnZGF0ZXRpbWUtcGlja2VyPVwieXl5eS1NTS1kZFwiICcgK1xuICAgICAgICAgICAgICAgICdlbmFibGUtdGltZT1cImZhbHNlXCIgJyArXG4gICAgICAgICAgICAgICAgJ25nLW1vZGVsPVwiY29tcG9uZW50Lm1heERhdGVcIiAvPicgK1xuICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJpbnB1dC1ncm91cC1idG5cIj4nICtcbiAgICAgICAgICAgICAgICAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cIm1heERhdGVPcGVuID0gdHJ1ZVwiPjxpIGNsYXNzPVwiZmEgZmEtY2FsZW5kYXJcIj48L2k+PC9idXR0b24+JyArXG4gICAgICAgICAgICAgICc8L3NwYW4+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJzdGFydGluZ0RheVwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cIj5TdGFydGluZyBEYXk8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInN0YXJ0aW5nRGF5XCIgbmFtZT1cInN0YXJ0aW5nRGF5XCIgbmctbW9kZWw9XCJjb21wb25lbnQuZGF0ZVBpY2tlci5zdGFydGluZ0RheVwiIG5nLW9wdGlvbnM9XCJpZHggYXMgZGF5IGZvciAoaWR4LCBkYXkpIGluIHN0YXJ0aW5nRGF5c1wiPjwvc2VsZWN0PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGFiZWwgZm9yPVwibWluTW9kZVwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIHNtYWxsZXN0IHVuaXQgb2YgdGltZSB2aWV3IHRvIGRpc3BsYXkgaW4gdGhlIGRhdGUgcGlja2VyLlwiPk1pbmltdW0gTW9kZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAnPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwibWluTW9kZVwiIG5hbWU9XCJtaW5Nb2RlXCIgbmctbW9kZWw9XCJjb21wb25lbnQuZGF0ZVBpY2tlci5taW5Nb2RlXCIgbmctb3B0aW9ucz1cIm1vZGUubmFtZSBhcyBtb2RlLmxhYmVsIGZvciBtb2RlIGluIG1vZGVzXCI+PC9zZWxlY3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJtYXhNb2RlXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgbGFyZ2VzdCB1bml0IG9mIHRpbWUgdmlldyB0byBkaXNwbGF5IGluIHRoZSBkYXRlIHBpY2tlci5cIj5NYXhpbXVtIE1vZGU8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cIm1heE1vZGVcIiBuYW1lPVwibWF4TW9kZVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LmRhdGVQaWNrZXIubWF4TW9kZVwiIG5nLW9wdGlvbnM9XCJtb2RlLm5hbWUgYXMgbW9kZS5sYWJlbCBmb3IgbW9kZSBpbiBtb2Rlc1wiPjwvc2VsZWN0PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkYXRlUGlja2VyLnllYXJSYW5nZVwiIGxhYmVsPVwiTnVtYmVyIG9mIFllYXJzIERpc3BsYXllZFwiIHBsYWNlaG9sZGVyPVwiWWVhciBSYW5nZVwiIHRpdGxlPVwiVGhlIG51bWJlciBvZiB5ZWFycyB0byBkaXNwbGF5IGluIHRoZSB5ZWFycyB2aWV3LlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcblxuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRhdGVQaWNrZXIuc2hvd1dlZWtzXCIgdHlwZT1cImNoZWNrYm94XCIgbGFiZWw9XCJTaG93IFdlZWsgTnVtYmVyc1wiIHRpdGxlPVwiRGlzcGxheXMgdGhlIHdlZWsgbnVtYmVycyBvbiB0aGUgZGF0ZSBwaWNrZXIuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvZGF0ZXRpbWUvdGltZS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY2hlY2tib3hcIj4nICtcbiAgICAgICAgICAgICc8bGFiZWwgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJFbmFibGVzIHRpbWUgaW5wdXQgZm9yIHRoaXMgZmllbGQuXCI+JyArXG4gICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJlbmFibGVUaW1lXCIgbmFtZT1cImVuYWJsZVRpbWVcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5lbmFibGVUaW1lXCIgbmctY2hlY2tlZD1cImNvbXBvbmVudC5lbmFibGVUaW1lXCIgbmctY2hhbmdlPVwic2V0Rm9ybWF0KClcIj4gRW5hYmxlIFRpbWUgSW5wdXQnICtcbiAgICAgICAgICAgICc8L2xhYmVsPicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0aW1lUGlja2VyLmhvdXJTdGVwXCIgdHlwZT1cIm51bWJlclwiIGxhYmVsPVwiSG91ciBTdGVwIFNpemVcIiB0aXRsZT1cIlRoZSBudW1iZXIgb2YgaG91cnMgdG8gaW5jcmVtZW50L2RlY3JlbWVudCBpbiB0aGUgdGltZSBwaWNrZXIuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRpbWVQaWNrZXIubWludXRlU3RlcFwiIHR5cGU9XCJudW1iZXJcIiBsYWJlbD1cIk1pbnV0ZSBTdGVwIFNpemVcIiB0aXRsZT1cIlRoZSBudW1iZXIgb2YgbWludXRlcyB0byBpbmNyZW1lbnQvZGVjcmVtZW50IGluIHRoZSB0aW1lIHBpY2tlci5cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidGltZVBpY2tlci5zaG93TWVyaWRpYW5cIiB0eXBlPVwiY2hlY2tib3hcIiBsYWJlbD1cIjEyIEhvdXIgVGltZSAoQU0vUE0pXCIgdGl0bGU9XCJEaXNwbGF5IHRpbWUgaW4gMTIgaG91ciB0aW1lIHdpdGggQU0vUE0uXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRpbWVQaWNrZXIucmVhZG9ubHlJbnB1dFwiIHR5cGU9XCJjaGVja2JveFwiIGxhYmVsPVwiUmVhZC1Pbmx5IElucHV0XCIgdGl0bGU9XCJNYWtlcyB0aGUgdGltZSBwaWNrZXIgaW5wdXQgYm94ZXMgcmVhZC1vbmx5LiBUaGUgdGltZSBjYW4gb25seSBiZSBjaGFuZ2VkIGJ5IHRoZSBpbmNyZW1lbnQvZGVjcmVtZW50IGJ1dHRvbnMuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvZGF0ZXRpbWUvdmFsaWRhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5yZXF1aXJlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24tY3VzdG9tLXZhbGlkYXRpb24+PC9mb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdkYXknLCB7XG4gICAgICAgIGljb246ICdmYSBmYS1jYWxlbmRhcicsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9kYXkvZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vZGF0YS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1ZhbGlkYXRpb24nLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9kYXkvdmFsaWRhdGUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI2RheSdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9kYXkvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxhYmVsXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImZpZWxkcy5kYXkucGxhY2Vob2xkZXJcIiBsYWJlbD1cIkRheSBQbGFjZWhvbGRlclwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmaWVsZHMubW9udGgucGxhY2Vob2xkZXJcIiBsYWJlbD1cIk1vbnRoIFBsYWNlaG9sZGVyXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImZpZWxkcy55ZWFyLnBsYWNlaG9sZGVyXCIgbGFiZWw9XCJZZWFyIFBsYWNlaG9sZGVyXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRheUZpcnN0XCIgdHlwZT1cImNoZWNrYm94XCIgbGFiZWw9XCJEYXkgZmlyc3RcIiB0aXRsZT1cIkRpc3BsYXkgdGhlIERheSBmaWVsZCBiZWZvcmUgdGhlIE1vbnRoIGZpZWxkLlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmaWVsZHMuZGF5LmhpZGVcIiB0eXBlPVwiY2hlY2tib3hcIiBsYWJlbD1cIkhpZGUgRGF5XCIgdGl0bGU9XCJIaWRlIHRoZSBkYXkgcGFydCBvZiB0aGUgY29tcG9uZW50LlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmaWVsZHMubW9udGguaGlkZVwiIHR5cGU9XCJjaGVja2JveFwiIGxhYmVsPVwiSGlkZSBNb250aFwiIHRpdGxlPVwiSGlkZSB0aGUgbW9udGggcGFydCBvZiB0aGUgY29tcG9uZW50LlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmaWVsZHMueWVhci5oaWRlXCIgdHlwZT1cImNoZWNrYm94XCIgbGFiZWw9XCJIaWRlIFllYXJcIiB0aXRsZT1cIkhpZGUgdGhlIHllYXIgcGFydCBvZiB0aGUgY29tcG9uZW50LlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJjdXN0b21DbGFzc1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJpbmRleFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcm90ZWN0ZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGVyc2lzdGVudFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkaXNhYmxlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9kYXkvdmFsaWRhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmaWVsZHMuZGF5LnJlcXVpcmVkXCIgbGFiZWw9XCJSZXF1aXJlIERheVwiIHR5cGU9XCJjaGVja2JveFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmaWVsZHMubW9udGgucmVxdWlyZWRcIiBsYWJlbD1cIlJlcXVpcmUgTW9udGhcIiB0eXBlPVwiY2hlY2tib3hcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZmllbGRzLnllYXIucmVxdWlyZWRcIiBsYWJlbD1cIlJlcXVpcmUgWWVhclwiIHR5cGU9XCJjaGVja2JveFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24tY3VzdG9tLXZhbGlkYXRpb24+PC9mb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgdmFyIHZpZXdzID0gXy5jbG9uZURlZXAoZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLiRnZXQoKS5jb21wb25lbnRzLnRleHRmaWVsZC52aWV3cyk7XG4gICAgICBfLmVhY2godmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgaWYgKHZpZXcubmFtZSA9PT0gJ1ZhbGlkYXRpb24nKSB7XG4gICAgICAgICAgdmlldy50ZW1wbGF0ZSA9ICdmb3JtaW8vY29tcG9uZW50cy9lbWFpbC92YWxpZGF0ZS5odG1sJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIucmVnaXN0ZXIoJ2VtYWlsJywge1xuICAgICAgICBpY29uOiAnZmEgZmEtYXQnLFxuICAgICAgICB2aWV3czogdmlld3MsXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jZW1haWwnXG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuICBhcHAucnVuKFtcbiAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2VtYWlsL3ZhbGlkYXRlLmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUucmVxdWlyZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidW5pcXVlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+PGgzIGNsYXNzPVwicGFuZWwtdGl0bGVcIj5LaWNrYm94PC9oMz48L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPicgK1xuICAgICAgICAgICAgICAnPHA+VmFsaWRhdGUgdGhpcyBlbWFpbCB1c2luZyB0aGUgS2lja2JveCBlbWFpbCB2YWxpZGF0aW9uIHNlcnZpY2UuPC9wPicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNoZWNrYm94XCI+JyArXG4gICAgICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJraWNrYm94LWVuYWJsZVwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiRW5hYmxlIEtpY2tib3ggdmFsaWRhdGlvbiBmb3IgdGhpcyBlbWFpbCBmaWVsZC5cIj4nICtcbiAgICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJraWNrYm94LWVuYWJsZVwiIG5hbWU9XCJraWNrYm94LWVuYWJsZVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LmtpY2tib3guZW5hYmxlZFwiPiBFbmFibGUnICtcbiAgICAgICAgICAgICAgICAnPC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5taW5MZW5ndGhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUubWF4TGVuZ3RoXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLnBhdHRlcm5cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPjwvZm9ybS1idWlsZGVyLW9wdGlvbi1jdXN0b20tdmFsaWRhdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcignZmllbGRzZXQnLCB7XG4gICAgICAgIGZidGVtcGxhdGU6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvZmllbGRzZXQuaHRtbCcsXG4gICAgICAgIGljb246ICdmYSBmYS10aC1sYXJnZScsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9maWVsZHNldC9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9jb25kaXRpb25hbC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ2h0dHA6Ly9oZWxwLmZvcm0uaW8vdXNlcmd1aWRlLyNmaWVsZHNldCcsXG4gICAgICAgIGtlZXBDaGlsZHJlbk9uUmVtb3ZlOiB0cnVlLFxuICAgICAgICBub0RuZE92ZXJsYXk6IHRydWUsXG4gICAgICAgIGNvbmZpcm1SZW1vdmU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2Zvcm1idWlsZGVyL2ZpZWxkc2V0Lmh0bWwnLFxuICAgICAgICAnPGZpZWxkc2V0PicgK1xuICAgICAgICAgICc8bGVnZW5kIG5nLWlmPVwiY29tcG9uZW50LmxlZ2VuZFwiPnt7IGNvbXBvbmVudC5sZWdlbmQgfX08L2xlZ2VuZD4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1saXN0IGNvbXBvbmVudD1cImNvbXBvbmVudFwiIGZvcm09XCJmb3JtXCIgZm9ybWlvPVwiOjpmb3JtaW9cIj48L2Zvcm0tYnVpbGRlci1saXN0PicgK1xuICAgICAgICAnPC9maWVsZHNldD4nXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHNldHRpbmdzIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvZmllbGRzZXQvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxlZ2VuZFwiIGxhYmVsPVwiTGVnZW5kXCIgcGxhY2Vob2xkZXI9XCJGaWVsZFNldCBMZWdlbmRcIiB0aXRsZT1cIlRoZSBsZWdlbmQgdGV4dCB0byBhcHBlYXIgYWJvdmUgdGhpcyBmaWVsZHNldC5cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhbXG4gICAgJ2Zvcm1pb0NvbXBvbmVudHNQcm92aWRlcicsXG4gICAgZnVuY3Rpb24oXG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXJcbiAgICApIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcignZmlsZScsIHtcbiAgICAgICAgb25FZGl0OiBbXG4gICAgICAgICAgJyRzY29wZScsXG4gICAgICAgICAgJ0Zvcm1pbycsXG4gICAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCBGb3JtaW8pIHtcbiAgICAgICAgICAgIC8vIFB1bGwgb3V0IHRpdGxlIGFuZCBuYW1lIGZyb20gdGhlIGxpc3Qgb2Ygc3RvcmFnZSBwbHVnaW5zLlxuICAgICAgICAgICAgJHNjb3BlLnN0b3JhZ2UgPSBfLm1hcChGb3JtaW8ucHJvdmlkZXJzLnN0b3JhZ2UsIGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBzdG9yYWdlLnRpdGxlLFxuICAgICAgICAgICAgICAgIG5hbWU6IGtleVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBpY29uOiAnZmEgZmEtZmlsZScsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9maWxlL2Rpc3BsYXkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdWYWxpZGF0aW9uJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvZmlsZS92YWxpZGF0ZS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdMYXlvdXQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vbGF5b3V0Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jZmlsZSdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9maWxlL2Rpc3BsYXkuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJsYWJlbFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGFiZWwgZm9yPVwic3RvcmFnZVwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiV2hpY2ggc3RvcmFnZSB0byBzYXZlIHRoZSBmaWxlcyBpbi5cIj5TdG9yYWdlPC9sYWJlbD4nICtcbiAgICAgICAgICAgICc8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJzdG9yYWdlXCIgbmFtZT1cInN0b3JhZ2VcIiBuZy1vcHRpb25zPVwic3RvcmUubmFtZSBhcyBzdG9yZS50aXRsZSBmb3Igc3RvcmUgaW4gc3RvcmFnZVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LnN0b3JhZ2VcIj48L3NlbGVjdD4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidXJsXCIgbmctc2hvdz1cImNvbXBvbmVudC5zdG9yYWdlID09PSBcXCd1cmxcXCdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZGlyXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImltYWdlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImltYWdlU2l6ZVwiIG5nLWlmPVwiY29tcG9uZW50LmltYWdlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cIm11bHRpcGxlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2ZpbGUvdmFsaWRhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5yZXF1aXJlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJmaWxlUGF0dGVyblwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcignaGlkZGVuJywge1xuICAgICAgICBmYnRlbXBsYXRlOiAnZm9ybWlvL2Zvcm1idWlsZGVyL2hpZGRlbi5odG1sJyxcbiAgICAgICAgaWNvbjogJ2ZhIGZhLXVzZXItc2VjcmV0JyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2hpZGRlbi9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9kYXRhLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2hpZGRlbi92YWxpZGF0aW9uLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI2hpZGRlbidcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2Zvcm1idWlsZGVyL2hpZGRlbi5odG1sJywgJzxzcGFuIGNsYXNzPVwiaGlkZGVuLWVsZW1lbnQtdGV4dFwiPnt7IGNvbXBvbmVudC5sYWJlbCB9fTwvc3Bhbj4nKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2hpZGRlbi9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibGFiZWxcIiBsYWJlbD1cIk5hbWVcIiBwbGFjZWhvbGRlcj1cIkVudGVyIHRoZSBuYW1lIGZvciB0aGlzIGhpZGRlbiBmaWVsZFwiIHRpdGxlPVwiVGhlIG5hbWUgZm9yIHRoaXMgZmllbGQuIEl0IGlzIG9ubHkgdXNlZCBmb3IgYWRtaW5pc3RyYXRpdmUgcHVycG9zZXMgc3VjaCBhcyBnZW5lcmF0aW5nIHRoZSBhdXRvbWF0aWMgcHJvcGVydHkgbmFtZSBpbiB0aGUgQVBJIHRhYiAod2hpY2ggbWF5IGJlIGNoYW5nZWQgbWFudWFsbHkpLlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJjdXN0b21DbGFzc1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcm90ZWN0ZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGVyc2lzdGVudFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9oaWRkZW4vdmFsaWRhdGlvbi5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInVuaXF1ZVwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcignaHRtbGVsZW1lbnQnLCB7XG4gICAgICAgIGZidGVtcGxhdGU6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvaHRtbGVsZW1lbnQuaHRtbCcsXG4gICAgICAgIGljb246ICdmYSBmYS1jb2RlJyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2h0bWxlbGVtZW50L2Rpc3BsYXkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jaHRtbC1lbGVtZW50LWNvbXBvbmVudCdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2Zvcm1idWlsZGVyL2h0bWxlbGVtZW50Lmh0bWwnLFxuICAgICAgICAnPGZvcm1pby1odG1sLWVsZW1lbnQgY29tcG9uZW50PVwiY29tcG9uZW50XCI+PC9kaXY+J1xuICAgICAgKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2h0bWxlbGVtZW50L2Rpc3BsYXkuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIiBsYWJlbD1cIkNvbnRhaW5lciBDdXN0b20gQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidGFnXCIgbGFiZWw9XCJIVE1MIFRhZ1wiIHBsYWNlaG9sZGVyPVwiSFRNTCBFbGVtZW50IFRhZ1wiIHRpdGxlPVwiVGhlIHRhZyBvZiB0aGlzIEhUTUwgZWxlbWVudC5cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY2xhc3NOYW1lXCIgbGFiZWw9XCJDU1MgQ2xhc3NcIiBwbGFjZWhvbGRlcj1cIkNTUyBDbGFzc1wiIHRpdGxlPVwiVGhlIENTUyBjbGFzcyBmb3IgdGhpcyBIVE1MIGVsZW1lbnQuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8dmFsdWUtYnVpbGRlciAnICtcbiAgICAgICAgICAgICdkYXRhPVwiY29tcG9uZW50LmF0dHJzXCIgJyArXG4gICAgICAgICAgICAnbGFiZWw9XCJBdHRyaWJ1dGVzXCIgJyArXG4gICAgICAgICAgICAndG9vbHRpcC10ZXh0PVwiVGhlIGF0dHJpYnV0ZXMgZm9yIHRoaXMgSFRNTCBlbGVtZW50LiBPbmx5IHNhZmUgYXR0cmlidXRlcyBhcmUgYWxsb3dlZCwgc3VjaCBhcyBzcmMsIGhyZWYsIGFuZCB0aXRsZS5cIiAnICtcbiAgICAgICAgICAgICd2YWx1ZS1wcm9wZXJ0eT1cInZhbHVlXCIgJyArXG4gICAgICAgICAgICAnbGFiZWwtcHJvcGVydHk9XCJhdHRyXCIgJyArXG4gICAgICAgICAgICAndmFsdWUtbGFiZWw9XCJWYWx1ZVwiICcgK1xuICAgICAgICAgICAgJ2xhYmVsLWxhYmVsPVwiQXR0cmlidXRlXCIgJyArXG4gICAgICAgICAgICAnbm8tYXV0b2NvbXBsZXRlLXZhbHVlPVwidHJ1ZVwiICcgK1xuICAgICAgICAgICc+PC92YWx1ZS1idWlsZGVyPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJjb250ZW50XCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgY29udGVudCBvZiB0aGlzIEhUTUwgZWxlbWVudC5cIj5Db250ZW50PC9sYWJlbD4nICtcbiAgICAgICAgICAgICc8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImNvbnRlbnRcIiBuYW1lPVwiY29udGVudFwiIG5nLW1vZGVsPVwiY29tcG9uZW50LmNvbnRlbnRcIiBwbGFjZWhvbGRlcj1cIkhUTUwgQ29udGVudFwiIHJvd3M9XCIzXCI+e3sgY29tcG9uZW50LmNvbnRlbnQgfX08L3RleHRhcmVhPicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ25nRm9ybUJ1aWxkZXInKTtcblxuLy8gQmFzaWNcbnJlcXVpcmUoJy4vY29tcG9uZW50cycpKGFwcCk7XG5yZXF1aXJlKCcuL3RleHRmaWVsZCcpKGFwcCk7XG5yZXF1aXJlKCcuL251bWJlcicpKGFwcCk7XG5yZXF1aXJlKCcuL3Bhc3N3b3JkJykoYXBwKTtcbnJlcXVpcmUoJy4vdGV4dGFyZWEnKShhcHApO1xucmVxdWlyZSgnLi9jaGVja2JveCcpKGFwcCk7XG5yZXF1aXJlKCcuL3NlbGVjdGJveGVzJykoYXBwKTtcbnJlcXVpcmUoJy4vc2VsZWN0JykoYXBwKTtcbnJlcXVpcmUoJy4vcmFkaW8nKShhcHApO1xucmVxdWlyZSgnLi9odG1sZWxlbWVudCcpKGFwcCk7XG5yZXF1aXJlKCcuL2NvbnRlbnQnKShhcHApO1xucmVxdWlyZSgnLi9idXR0b24nKShhcHApO1xuXG4vLyBTcGVjaWFsXG5yZXF1aXJlKCcuL2VtYWlsJykoYXBwKTtcbnJlcXVpcmUoJy4vcGhvbmVudW1iZXInKShhcHApO1xucmVxdWlyZSgnLi9hZGRyZXNzJykoYXBwKTtcbnJlcXVpcmUoJy4vZGF0ZXRpbWUnKShhcHApO1xucmVxdWlyZSgnLi9kYXknKShhcHApO1xucmVxdWlyZSgnLi9jdXJyZW5jeScpKGFwcCk7XG5yZXF1aXJlKCcuL2hpZGRlbicpKGFwcCk7XG5yZXF1aXJlKCcuL3Jlc291cmNlJykoYXBwKTtcbnJlcXVpcmUoJy4vZmlsZScpKGFwcCk7XG5yZXF1aXJlKCcuL3NpZ25hdHVyZScpKGFwcCk7XG5yZXF1aXJlKCcuL2N1c3RvbScpKGFwcCk7XG5yZXF1aXJlKCcuL2RhdGFncmlkJykoYXBwKTtcbnJlcXVpcmUoJy4vc3VydmV5JykoYXBwKTtcblxuLy8gTGF5b3V0XG5yZXF1aXJlKCcuL2NvbHVtbnMnKShhcHApO1xucmVxdWlyZSgnLi9maWVsZHNldCcpKGFwcCk7XG5yZXF1aXJlKCcuL2NvbnRhaW5lcicpKGFwcCk7XG5yZXF1aXJlKCcuL3BhZ2UnKShhcHApO1xucmVxdWlyZSgnLi9wYW5lbCcpKGFwcCk7XG5yZXF1aXJlKCcuL3RhYmxlJykoYXBwKTtcbnJlcXVpcmUoJy4vd2VsbCcpKGFwcCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdudW1iZXInLCB7XG4gICAgICAgIGljb246ICdmYSBmYS1oYXNodGFnJyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL251bWJlci9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9kYXRhLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL251bWJlci92YWxpZGF0ZS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdMYXlvdXQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vbGF5b3V0Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jbnVtYmVyJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL251bWJlci9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibGFiZWxcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGxhY2Vob2xkZXJcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZGVzY3JpcHRpb25cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUuc3RlcFwiIGxhYmVsPVwiSW5jcmVtZW50IChTdGVwKVwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgaG93IG11Y2ggdG8gaW5jcmVtZW50IHBlciBzdGVwIChvciBwcmVjaXNpb24pLlwiIHRpdGxlPVwiVGhlIGFtb3VudCB0byBpbmNyZW1lbnQvZGVjcmVtZW50IGZvciBlYWNoIHN0ZXAuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByZWZpeFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJzdWZmaXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidGFiaW5kZXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibXVsdGlwbGVcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicHJvdGVjdGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInBlcnNpc3RlbnRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZGlzYWJsZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidGFibGVWaWV3XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgQVBJIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvbnVtYmVyL3ZhbGlkYXRlLmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUucmVxdWlyZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUubWluXCIgdHlwZT1cIm51bWJlclwiIGxhYmVsPVwiTWluaW11bSBWYWx1ZVwiIHBsYWNlaG9sZGVyPVwiTWluaW11bSBWYWx1ZVwiIHRpdGxlPVwiVGhlIG1pbmltdW0gdmFsdWUgdGhpcyBmaWVsZCBtdXN0IGhhdmUgYmVmb3JlIHRoZSBmb3JtIGNhbiBiZSBzdWJtaXR0ZWQuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLm1heFwiIHR5cGU9XCJudW1iZXJcIiBsYWJlbD1cIk1heGltdW0gVmFsdWVcIiBwbGFjZWhvbGRlcj1cIk1heGltdW0gVmFsdWVcIiB0aXRsZT1cIlRoZSBtYXhpbXVtIHZhbHVlIHRoaXMgZmllbGQgbXVzdCBoYXZlIGJlZm9yZSB0aGUgZm9ybSBjYW4gYmUgc3VibWl0dGVkLlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24tY3VzdG9tLXZhbGlkYXRpb24+PC9mb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdwYWdlJywge1xuICAgICAgICBmYnRlbXBsYXRlOiAnZm9ybWlvL2Zvcm1idWlsZGVyL3BhZ2UuaHRtbCdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2Zvcm1idWlsZGVyL3BhZ2UuaHRtbCcsXG4gICAgICAgICc8Zm9ybS1idWlsZGVyLWxpc3QgY29tcG9uZW50PVwiY29tcG9uZW50XCIgZm9ybT1cImZvcm1cIiBmb3JtaW89XCI6OmZvcm1pb1wiPjwvZm9ybS1idWlsZGVyLWxpc3Q+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhbXG4gICAgJ2Zvcm1pb0NvbXBvbmVudHNQcm92aWRlcicsXG4gICAgJ0ZPUk1fT1BUSU9OUycsXG4gICAgZnVuY3Rpb24oXG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIsXG4gICAgICBGT1JNX09QVElPTlNcbiAgICApIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcigncGFuZWwnLCB7XG4gICAgICAgIGZidGVtcGxhdGU6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvcGFuZWwuaHRtbCcsXG4gICAgICAgIGljb246ICdmYSBmYS1saXN0LWFsdCcsXG4gICAgICAgIG9uRWRpdDogWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgICAkc2NvcGUudGhlbWVzID0gRk9STV9PUFRJT05TLnRoZW1lcztcbiAgICAgICAgfV0sXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9wYW5lbC9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9jb25kaXRpb25hbC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ2h0dHA6Ly9oZWxwLmZvcm0uaW8vdXNlcmd1aWRlLyNwYW5lbHMnLFxuICAgICAgICBub0RuZE92ZXJsYXk6IHRydWUsXG4gICAgICAgIGNvbmZpcm1SZW1vdmU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2Zvcm1idWlsZGVyL3BhbmVsLmh0bWwnLFxuICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLXt7IGNvbXBvbmVudC50aGVtZSB9fVwiPicgK1xuICAgICAgICAgICc8ZGl2IG5nLWlmPVwiY29tcG9uZW50LnRpdGxlXCIgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+PGgzIGNsYXNzPVwicGFuZWwtdGl0bGVcIj57eyBjb21wb25lbnQudGl0bGUgfX08L2gzPjwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPicgK1xuICAgICAgICAgICAgJzxmb3JtLWJ1aWxkZXItbGlzdCBjb21wb25lbnQ9XCJjb21wb25lbnRcIiBmb3JtPVwiZm9ybVwiIGZvcm1pbz1cIjo6Zm9ybWlvXCI+PC9mb3JtLWJ1aWxkZXItbGlzdD4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHNldHRpbmdzIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvcGFuZWwvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRpdGxlXCIgbGFiZWw9XCJUaXRsZVwiIHBsYWNlaG9sZGVyPVwiUGFuZWwgVGl0bGVcIiB0aXRsZT1cIlRoZSB0aXRsZSB0ZXh0IHRoYXQgYXBwZWFycyBpbiB0aGUgaGVhZGVyIG9mIHRoaXMgcGFuZWwuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJ0aGVtZVwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIGNvbG9yIHRoZW1lIG9mIHRoaXMgcGFuZWwuXCI+VGhlbWU8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInRoZW1lXCIgbmFtZT1cInRoZW1lXCIgbmctb3B0aW9ucz1cInRoZW1lLm5hbWUgYXMgdGhlbWUudGl0bGUgZm9yIHRoZW1lIGluIHRoZW1lc1wiIG5nLW1vZGVsPVwiY29tcG9uZW50LnRoZW1lXCI+PC9zZWxlY3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdwYXNzd29yZCcsIHtcbiAgICAgICAgaWNvbjogJ2ZhIGZhLWFzdGVyaXNrJyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3Bhc3N3b3JkL2Rpc3BsYXkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdWYWxpZGF0aW9uJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvdGV4dGZpZWxkL3ZhbGlkYXRlLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2FwaS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0xheW91dCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9sYXlvdXQuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9jb25kaXRpb25hbC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ2h0dHA6Ly9oZWxwLmZvcm0uaW8vdXNlcmd1aWRlLyNwYXNzd29yZCcsXG4gICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvcGFzc3dvcmQuaHRtbCdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oXG4gICAgICAkdGVtcGxhdGVDYWNoZVxuICAgICkge1xuICAgICAgLy8gRGlzYWJsZSBkcmFnZ2luZyBvbiBwYXNzd29yZCBpbnB1dHMgYmVjYXVzZSBpdCBicmVha3MgZG5kTGlzdHNcbiAgICAgIHZhciB0ZXh0RmllbGRUbXBsID0gJHRlbXBsYXRlQ2FjaGUuZ2V0KCdmb3JtaW8vY29tcG9uZW50cy90ZXh0ZmllbGQuaHRtbCcpO1xuICAgICAgdmFyIHBhc3N3b3JkVG1wbCA9IHRleHRGaWVsZFRtcGwucmVwbGFjZShcbiAgICAgICAgLzxpbnB1dCB0eXBlPVwie3sgY29tcG9uZW50LmlucHV0VHlwZSB9fVwiIC9nLFxuICAgICAgICAnPGlucHV0IHR5cGU9XCJ7eyBjb21wb25lbnQuaW5wdXRUeXBlIH19XCIgZG5kLW5vZHJhZyAnXG4gICAgICApO1xuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9wYXNzd29yZC5odG1sJywgcGFzc3dvcmRUbXBsKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3Bhc3N3b3JkL2Rpc3BsYXkuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJsYWJlbFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwbGFjZWhvbGRlclwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkZXNjcmlwdGlvblwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcmVmaXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwic3VmZml4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcigncGhvbmVOdW1iZXInLCB7XG4gICAgICAgIGljb246ICdmYSBmYS1waG9uZS1zcXVhcmUnLFxuICAgICAgICB2aWV3czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdEaXNwbGF5JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvcGhvbmVOdW1iZXIvZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vZGF0YS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1ZhbGlkYXRpb24nLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9waG9uZU51bWJlci92YWxpZGF0ZS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdMYXlvdXQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vbGF5b3V0Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jcGhvbmVudW1iZXInXG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuICBhcHAucnVuKFtcbiAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAvLyBDcmVhdGUgdGhlIHNldHRpbmdzIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvcGhvbmVOdW1iZXIvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxhYmVsXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInBsYWNlaG9sZGVyXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRlc2NyaXB0aW9uXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImlucHV0TWFza1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcmVmaXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwic3VmZml4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cIm11bHRpcGxlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIFZhbGlkYXRpb24gbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9waG9uZU51bWJlci92YWxpZGF0ZS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLnJlcXVpcmVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInVuaXF1ZVwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcigncmFkaW8nLCB7XG4gICAgICAgIGljb246ICdmYSBmYS1kb3QtY2lyY2xlLW8nLFxuICAgICAgICB2aWV3czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdEaXNwbGF5JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvcmFkaW8vZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vZGF0YS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1ZhbGlkYXRpb24nLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9yYWRpby92YWxpZGF0ZS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdMYXlvdXQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vbGF5b3V0Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jcmFkaW8nXG4gICAgICB9KTtcbiAgICB9XG4gIF0pO1xuICBhcHAucnVuKFtcbiAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAvLyBDcmVhdGUgdGhlIHNldHRpbmdzIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvcmFkaW8vZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxhYmVsXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8dmFsdWUtYnVpbGRlciBkYXRhPVwiY29tcG9uZW50LnZhbHVlc1wiIGRlZmF1bHQ9XCJjb21wb25lbnQuZGVmYXVsdFZhbHVlXCIgbGFiZWw9XCJWYWx1ZXNcIiB0b29sdGlwLXRleHQ9XCJUaGUgcmFkaW8gYnV0dG9uIHZhbHVlcyB0aGF0IGNhbiBiZSBwaWNrZWQgZm9yIHRoaXMgZmllbGQuIFZhbHVlcyBhcmUgdGV4dCBzdWJtaXR0ZWQgd2l0aCB0aGUgZm9ybSBkYXRhLiBMYWJlbHMgYXJlIHRleHQgdGhhdCBhcHBlYXJzIG5leHQgdG8gdGhlIHJhZGlvIGJ1dHRvbnMgb24gdGhlIGZvcm0uXCI+PC92YWx1ZS1idWlsZGVyPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImlubGluZVwiIHR5cGU9XCJjaGVja2JveFwiIGxhYmVsPVwiSW5saW5lIExheW91dFwiIHRpdGxlPVwiRGlzcGxheXMgdGhlIHJhZGlvIGJ1dHRvbnMgaG9yaXpvbnRhbGx5LlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcm90ZWN0ZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGVyc2lzdGVudFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkaXNhYmxlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICAgIC8vIENyZWF0ZSB0aGUgQVBJIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvcmFkaW8vdmFsaWRhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5yZXF1aXJlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24tY3VzdG9tLXZhbGlkYXRpb24+PC9mb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdyZXNvdXJjZScsIHtcbiAgICAgICAgb25FZGl0OiBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICRzY29wZS5yZXNvdXJjZXMgPSBbXTtcbiAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LnByb2plY3QgPSAkc2NvcGUuZm9ybWlvLnByb2plY3RJZDtcbiAgICAgICAgICAkc2NvcGUuZm9ybWlvLmxvYWRGb3Jtcyh7cGFyYW1zOiB7dHlwZTogJ3Jlc291cmNlJywgbGltaXQ6IDEwMH19KS50aGVuKGZ1bmN0aW9uKHJlc291cmNlcykge1xuICAgICAgICAgICAgJHNjb3BlLnJlc291cmNlcyA9IHJlc291cmNlcztcbiAgICAgICAgICAgIGlmICghJHNjb3BlLmNvbXBvbmVudC5yZXNvdXJjZSkge1xuICAgICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LnJlc291cmNlID0gcmVzb3VyY2VzWzBdLl9pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfV0sXG4gICAgICAgIGljb246ICdmYSBmYS1maWxlcy1vJyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3Jlc291cmNlL2Rpc3BsYXkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdWYWxpZGF0aW9uJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvcmVzb3VyY2UvdmFsaWRhdGUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI3Jlc291cmNlJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3Jlc291cmNlL2Rpc3BsYXkuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJsYWJlbFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwbGFjZWhvbGRlclwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGFiZWwgZm9yPVwicGxhY2Vob2xkZXJcIiBmb3JtLWJ1aWxkZXItdG9vbHRpcD1cIlRoZSByZXNvdXJjZSB0byBiZSB1c2VkIHdpdGggdGhpcyBmaWVsZC5cIj5SZXNvdXJjZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAnPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicmVzb3VyY2VcIiBuYW1lPVwicmVzb3VyY2VcIiBuZy1vcHRpb25zPVwidmFsdWUuX2lkIGFzIHZhbHVlLnRpdGxlIGZvciB2YWx1ZSBpbiByZXNvdXJjZXNcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5yZXNvdXJjZVwiPjwvc2VsZWN0PicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGFiZWwgZm9yPVwicGxhY2Vob2xkZXJcIiBmb3JtLWJ1aWxkZXItdG9vbHRpcD1cIlRoZSBwcm9wZXJ0aWVzIG9uIHRoZSByZXNvdXJjZSB0byByZXR1cm4gYXMgcGFydCBvZiB0aGUgb3B0aW9ucy4gU2VwYXJhdGUgcHJvcGVydHkgbmFtZXMgYnkgY29tbWFzLiBJZiBsZWZ0IGJsYW5rLCBhbGwgcHJvcGVydGllcyB3aWxsIGJlIHJldHVybmVkLlwiPlNlbGVjdCBGaWVsZHM8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJzZWxlY3RGaWVsZHNcIiBuYW1lPVwic2VsZWN0RmllbGRzXCIgbmctbW9kZWw9XCJjb21wb25lbnQuc2VsZWN0RmllbGRzXCIgcGxhY2Vob2xkZXI9XCJDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBmaWVsZHMgdG8gc2VsZWN0LlwiIHZhbHVlPVwie3sgY29tcG9uZW50LnNlbGVjdEZpZWxkcyB9fVwiPicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICc8bGFiZWwgZm9yPVwicGxhY2Vob2xkZXJcIiBmb3JtLWJ1aWxkZXItdG9vbHRpcD1cIkEgbGlzdCBvZiBzZWFyY2ggZmlsdGVycyBiYXNlZCBvbiB0aGUgZmllbGRzIG9mIHRoZSByZXNvdXJjZS4gU2VlIHRoZSA8YSB0YXJnZXQ9XFwnX2JsYW5rXFwnIGhyZWY9XFwnaHR0cHM6Ly9naXRodWIuY29tL3RyYXZpc3QvcmVzb3VyY2VqcyNmaWx0ZXJpbmctdGhlLXJlc3VsdHNcXCc+UmVzb3VyY2UuanMgZG9jdW1lbnRhdGlvbjwvYT4gZm9yIHRoZSBmb3JtYXQgb2YgdGhlc2UgZmlsdGVycy5cIj5TZWFyY2ggRmllbGRzPC9sYWJlbD4nICtcbiAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwic2VhcmNoRmllbGRzXCIgbmFtZT1cInNlYXJjaEZpZWxkc1wiIG5nLW1vZGVsPVwiY29tcG9uZW50LnNlYXJjaEZpZWxkc1wiIG5nLWxpc3QgcGxhY2Vob2xkZXI9XCJUaGUgZmllbGRzIHRvIHF1ZXJ5IG9uIHRoZSBzZXJ2ZXJcIiB2YWx1ZT1cInt7IGNvbXBvbmVudC5zZWFyY2hGaWVsZHMgfX1cIj4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cInBsYWNlaG9sZGVyXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgSFRNTCB0ZW1wbGF0ZSBmb3IgdGhlIHJlc3VsdCBkYXRhIGl0ZW1zLlwiPkl0ZW0gVGVtcGxhdGU8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzx0ZXh0YXJlYSBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwidGVtcGxhdGVcIiBuYW1lPVwidGVtcGxhdGVcIiBuZy1tb2RlbD1cImNvbXBvbmVudC50ZW1wbGF0ZVwiIHJvd3M9XCIzXCI+e3sgY29tcG9uZW50LnRlbXBsYXRlIH19PC90ZXh0YXJlYT4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidGFiaW5kZXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwibXVsdGlwbGVcIiBsYWJlbD1cIkFsbG93IE11bHRpcGxlIFJlc291cmNlc1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkaXNhYmxlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBBUEkgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9yZXNvdXJjZS92YWxpZGF0ZS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLnJlcXVpcmVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAnPC9uZy1mb3JtPidcbiAgICAgICk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCdzZWxlY3QnLCB7XG4gICAgICAgIGljb246ICdmYSBmYS10aC1saXN0JyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdC9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdC9kYXRhLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdC92YWxpZGF0ZS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdMYXlvdXQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vbGF5b3V0Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIG9uRWRpdDogWyckc2NvcGUnLCAnRm9ybWlvVXRpbHMnLCBmdW5jdGlvbigkc2NvcGUsIEZvcm1pb1V0aWxzKSB7XG4gICAgICAgICAgJHNjb3BlLmRhdGFTb3VyY2VzID0ge1xuICAgICAgICAgICAgdmFsdWVzOiAnVmFsdWVzJyxcbiAgICAgICAgICAgIGpzb246ICdSYXcgSlNPTicsXG4gICAgICAgICAgICB1cmw6ICdVUkwnLFxuICAgICAgICAgICAgcmVzb3VyY2U6ICdSZXNvdXJjZScsXG4gICAgICAgICAgICBjdXN0b206ICdDdXN0b20nXG4gICAgICAgICAgfTtcbiAgICAgICAgICAkc2NvcGUucmVzb3VyY2VzID0gW107XG4gICAgICAgICAgJHNjb3BlLnJlc291cmNlRmllbGRzID0gW107XG5cbiAgICAgICAgICAvLyBSZXR1cm5zIG9ubHkgaW5wdXQgZmllbGRzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgICAgICAgIHZhciBnZXRJbnB1dEZpZWxkcyA9IGZ1bmN0aW9uKGNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIHZhciBmaWVsZHMgPSBbXTtcbiAgICAgICAgICAgIEZvcm1pb1V0aWxzLmVhY2hDb21wb25lbnQoY29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgIGlmIChjb21wb25lbnQua2V5ICYmIGNvbXBvbmVudC5pbnB1dCAmJiAoY29tcG9uZW50LnR5cGUgIT09ICdidXR0b24nKSAmJiBjb21wb25lbnQua2V5ICE9PSAkc2NvcGUuY29tcG9uZW50LmtleSkge1xuICAgICAgICAgICAgICAgIHZhciBjb21wID0gXy5jbG9uZShjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIGlmICghY29tcC5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgY29tcC5sYWJlbCA9IGNvbXAua2V5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWVsZHMucHVzaChjb21wKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRzO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAkc2NvcGUuZm9ybUZpZWxkcyA9IFt7bGFiZWw6ICdBbnkgQ2hhbmdlJywga2V5OiAnZGF0YSd9XS5jb25jYXQoZ2V0SW5wdXRGaWVsZHMoJHNjb3BlLmZvcm0uY29tcG9uZW50cykpO1xuXG4gICAgICAgICAgLy8gTG9hZHMgdGhlIHNlbGVjdGVkIGZpZWxkcy5cbiAgICAgICAgICB2YXIgbG9hZEZpZWxkcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCEkc2NvcGUuY29tcG9uZW50LmRhdGEucmVzb3VyY2UgfHwgKCRzY29wZS5yZXNvdXJjZXMubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgICAgICAgJHNjb3BlLnJlc291cmNlRmllbGRzID0gW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICcnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAne0VudGlyZSBPYmplY3R9J1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdfaWQnLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnU3VibWlzc2lvbiBJZCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZm9ybWlvLnByb2plY3RJZCkge1xuICAgICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LmRhdGEucHJvamVjdCA9ICRzY29wZS5mb3JtaW8ucHJvamVjdElkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggaW4gJHNjb3BlLnJlc291cmNlcykge1xuICAgICAgICAgICAgICBpZiAoJHNjb3BlLnJlc291cmNlc1tpbmRleF0uX2lkLnRvU3RyaW5nKCkgPT09ICRzY29wZS5jb21wb25lbnQuZGF0YS5yZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gJHNjb3BlLnJlc291cmNlc1tpbmRleF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgICB2YXIgZmllbGRzID0gZ2V0SW5wdXRGaWVsZHMoc2VsZWN0ZWQuY29tcG9uZW50cyk7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZmllbGRzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpZWxkID0gZmllbGRzW2ldO1xuICAgICAgICAgICAgICAgIHZhciB0aXRsZSA9IGZpZWxkLmxhYmVsIHx8IGZpZWxkLmtleTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVzb3VyY2VGaWVsZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RhdGEuJyArIGZpZWxkLmtleSxcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLmNvbXBvbmVudC52YWx1ZVByb3BlcnR5ICYmICRzY29wZS5yZXNvdXJjZUZpZWxkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LnZhbHVlUHJvcGVydHkgPSAkc2NvcGUucmVzb3VyY2VGaWVsZHNbMF0ucHJvcGVydHk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgJHNjb3BlLiR3YXRjaCgnY29tcG9uZW50LmRhdGFTcmMnLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmICgoJHNjb3BlLnJlc291cmNlcy5sZW5ndGggPT09IDApICYmIChzb3VyY2UgPT09ICdyZXNvdXJjZScpKSB7XG4gICAgICAgICAgICAgICRzY29wZS5mb3JtaW8ubG9hZEZvcm1zKHtwYXJhbXM6IHt0eXBlOiAncmVzb3VyY2UnLCBsaW1pdDogNDI5NDk2NzI5NX19KS50aGVuKGZ1bmN0aW9uKHJlc291cmNlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XG4gICAgICAgICAgICAgICAgbG9hZEZpZWxkcygpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFRyaWdnZXIgd2hlbiB0aGUgcmVzb3VyY2UgY2hhbmdlcy5cbiAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdjb21wb25lbnQuZGF0YS5yZXNvdXJjZScsIGZ1bmN0aW9uKHJlc291cmNlSWQpIHtcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2VJZCkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2FkRmllbGRzKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBVcGRhdGUgb3RoZXIgcGFyYW1ldGVycyB3aGVuIHRoZSB2YWx1ZSBwcm9wZXJ0eSBjaGFuZ2VzLlxuICAgICAgICAgICRzY29wZS5jdXJyZW50VmFsdWVQcm9wZXJ0eSA9ICRzY29wZS5jb21wb25lbnQudmFsdWVQcm9wZXJ0eTtcbiAgICAgICAgICAkc2NvcGUuJHdhdGNoKCdjb21wb25lbnQudmFsdWVQcm9wZXJ0eScsIGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbXBvbmVudC5kYXRhU3JjID09PSAncmVzb3VyY2UnICYmICRzY29wZS5jdXJyZW50VmFsdWVQcm9wZXJ0eSAhPT0gcHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5jb21wb25lbnQuc2VhcmNoRmllbGQgPSAnJztcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LnRlbXBsYXRlID0gJzxzcGFuPnt7IGl0ZW0uZGF0YSB9fTwvc3Bhbj4nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5jb21wb25lbnQuc2VhcmNoRmllbGQgPSBwcm9wZXJ0eSArICdfX3JlZ2V4JztcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LnRlbXBsYXRlID0gJzxzcGFuPnt7IGl0ZW0uJyArIHByb3BlcnR5ICsgJyB9fTwvc3Bhbj4nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBsb2FkRmllbGRzKCk7XG4gICAgICAgIH1dLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI3NlbGVjdCdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9zZWxlY3QvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxhYmVsXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInBsYWNlaG9sZGVyXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRlc2NyaXB0aW9uXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cIm11bHRpcGxlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdC9kYXRhLmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cImRhdGFTcmNcIiBmb3JtLWJ1aWxkZXItdG9vbHRpcD1cIlRoZSBzb3VyY2UgdG8gdXNlIGZvciB0aGUgc2VsZWN0IGRhdGEuIFZhbHVlcyBsZXRzIHlvdSBwcm92aWRlIHlvdXIgb3duIHZhbHVlcyBhbmQgbGFiZWxzLiBKU09OIGxldHMgeW91IHByb3ZpZGUgcmF3IEpTT04gZGF0YS4gVVJMIGxldHMgeW91IHByb3ZpZGUgYSBVUkwgdG8gcmV0cmlldmUgdGhlIEpTT04gZGF0YSBmcm9tLlwiPkRhdGEgU291cmNlIFR5cGU8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImRhdGFTcmNcIiBuYW1lPVwiZGF0YVNyY1wiIG5nLW1vZGVsPVwiY29tcG9uZW50LmRhdGFTcmNcIiBuZy1vcHRpb25zPVwidmFsdWUgYXMgbGFiZWwgZm9yICh2YWx1ZSwgbGFiZWwpIGluIGRhdGFTb3VyY2VzXCI+PC9zZWxlY3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8bmctc3dpdGNoIG9uPVwiY29tcG9uZW50LmRhdGFTcmNcIj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiIG5nLXN3aXRjaC13aGVuPVwianNvblwiPicgK1xuICAgICAgICAgICAgICAnPGxhYmVsIGZvcj1cImRhdGEuanNvblwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiQSByYXcgSlNPTiBhcnJheSB0byB1c2UgYXMgYSBkYXRhIHNvdXJjZS5cIj5EYXRhIFNvdXJjZSBSYXcgSlNPTjwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICc8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImRhdGEuanNvblwiIG5hbWU9XCJkYXRhLmpzb25cIiBuZy1tb2RlbD1cImNvbXBvbmVudC5kYXRhLmpzb25cIiBwbGFjZWhvbGRlcj1cIlJhdyBKU09OIEFycmF5XCIganNvbi1pbnB1dCByb3dzPVwiM1wiPnt7IGNvbXBvbmVudC5kYXRhLmpzb24gfX08L3RleHRhcmVhPicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIG5nLXN3aXRjaC13aGVuPVwidXJsXCIgcHJvcGVydHk9XCJkYXRhLnVybFwiIGxhYmVsPVwiRGF0YSBTb3VyY2UgVVJMXCIgcGxhY2Vob2xkZXI9XCJEYXRhIFNvdXJjZSBVUkxcIiB0aXRsZT1cIkEgVVJMIHRoYXQgcmV0dXJucyBhIEpTT04gYXJyYXkgdG8gdXNlIGFzIHRoZSBkYXRhIHNvdXJjZS5cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgICAnPHZhbHVlLWJ1aWxkZXIgbmctc3dpdGNoLXdoZW49XCJ2YWx1ZXNcIiBkYXRhPVwiY29tcG9uZW50LmRhdGEudmFsdWVzXCIgbGFiZWw9XCJEYXRhIFNvdXJjZSBWYWx1ZXNcIiB0b29sdGlwLXRleHQ9XCJWYWx1ZXMgdG8gdXNlIGFzIHRoZSBkYXRhIHNvdXJjZS4gTGFiZWxzIGFyZSBzaG93biBpbiB0aGUgc2VsZWN0IGZpZWxkLiBWYWx1ZXMgYXJlIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcyBzYXZlZCB3aXRoIHRoZSBzdWJtaXNzaW9uLlwiPjwvdmFsdWUtYnVpbGRlcj4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIiBuZy1zd2l0Y2gtd2hlbj1cInJlc291cmNlXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cInBsYWNlaG9sZGVyXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgcmVzb3VyY2UgdG8gYmUgdXNlZCB3aXRoIHRoaXMgZmllbGQuXCI+UmVzb3VyY2U8L2xhYmVsPicgK1xuICAgICAgICAgICAgJzx1aS1zZWxlY3QgdWktc2VsZWN0LXJlcXVpcmVkIHVpLXNlbGVjdC1vcGVuLW9uLWZvY3VzIG5nLW1vZGVsPVwiY29tcG9uZW50LmRhdGEucmVzb3VyY2VcIiB0aGVtZT1cImJvb3RzdHJhcFwiPicgK1xuICAgICAgICAgICAgICAnPHVpLXNlbGVjdC1tYXRjaCBjbGFzcz1cInVpLXNlbGVjdC1tYXRjaFwiIHBsYWNlaG9sZGVyPVwiXCI+JyArXG4gICAgICAgICAgICAgICAgJ3t7JHNlbGVjdC5zZWxlY3RlZC50aXRsZX19JyArXG4gICAgICAgICAgICAgICc8L3VpLXNlbGVjdC1tYXRjaD4nICtcbiAgICAgICAgICAgICAgJzx1aS1zZWxlY3QtY2hvaWNlcyBjbGFzcz1cInVpLXNlbGVjdC1jaG9pY2VzXCIgcmVwZWF0PVwidmFsdWUuX2lkIGFzIHZhbHVlIGluIHJlc291cmNlcyB8IGZpbHRlcjogJHNlbGVjdC5zZWFyY2hcIiByZWZyZXNoPVwicmVmcmVzaFN1Ym1pc3Npb25zKCRzZWxlY3Quc2VhcmNoKVwiIHJlZnJlc2gtZGVsYXk9XCIyNTBcIj4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBuZy1iaW5kLWh0bWw9XCJ2YWx1ZS50aXRsZSB8IGhpZ2hsaWdodDogJHNlbGVjdC5zZWFyY2hcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgJzwvdWktc2VsZWN0LWNob2ljZXM+JyArXG4gICAgICAgICAgICAnPC91aS1zZWxlY3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8L25nLXN3aXRjaD4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gbmctaGlkZT1cImNvbXBvbmVudC5kYXRhU3JjICE9PSBcXCd1cmxcXCdcIiBwcm9wZXJ0eT1cInNlbGVjdFZhbHVlc1wiIGxhYmVsPVwiRGF0YSBQYXRoXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIlRoZSBvYmplY3QgcGF0aCB0byB0aGUgaXRlcmFibGUgaXRlbXMuXCIgdGl0bGU9XCJUaGUgcHJvcGVydHkgd2l0aGluIHRoZSBzb3VyY2UgZGF0YSwgd2hlcmUgaXRlcmFibGUgaXRlbXMgcmVzaWRlLiBGb3IgZXhhbXBsZTogcmVzdWx0cy5pdGVtcyBvciByZXN1bHRzWzBdLml0ZW1zXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBuZy1oaWRlPVwiY29tcG9uZW50LmRhdGFTcmMgPT0gXFwndmFsdWVzXFwnIHx8IGNvbXBvbmVudC5kYXRhU3JjID09IFxcJ3Jlc291cmNlXFwnIHx8IGNvbXBvbmVudC5kYXRhU3JjID09IFxcJ2N1c3RvbVxcJ1wiIHByb3BlcnR5PVwidmFsdWVQcm9wZXJ0eVwiIGxhYmVsPVwiVmFsdWUgUHJvcGVydHlcIiBwbGFjZWhvbGRlcj1cIlRoZSBzZWxlY3RlZCBpdGVtXFwncyBwcm9wZXJ0eSB0byBzYXZlLlwiIHRpdGxlPVwiVGhlIHByb3BlcnR5IG9mIGVhY2ggaXRlbSBpbiB0aGUgZGF0YSBzb3VyY2UgdG8gdXNlIGFzIHRoZSBzZWxlY3QgdmFsdWUuIElmIG5vdCBzcGVjaWZpZWQsIHRoZSBpdGVtIGl0c2VsZiB3aWxsIGJlIHVzZWQuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiIG5nLWhpZGU9XCJjb21wb25lbnQuZGF0YVNyYyAhPT0gXFwncmVzb3VyY2VcXCcgfHwgIWNvbXBvbmVudC5kYXRhLnJlc291cmNlIHx8IHJlc291cmNlRmllbGRzLmxlbmd0aCA9PSAwXCI+JyArXG4gICAgICAgICAgICAnPGxhYmVsIGZvcj1cInBsYWNlaG9sZGVyXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgZmllbGQgdG8gdXNlIGFzIHRoZSB2YWx1ZS5cIj5WYWx1ZTwvbGFiZWw+JyArXG4gICAgICAgICAgICAnPHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwidmFsdWVQcm9wZXJ0eVwiIG5hbWU9XCJ2YWx1ZVByb3BlcnR5XCIgbmctb3B0aW9ucz1cInZhbHVlLnByb3BlcnR5IGFzIHZhbHVlLnRpdGxlIGZvciB2YWx1ZSBpbiByZXNvdXJjZUZpZWxkc1wiIG5nLW1vZGVsPVwiY29tcG9uZW50LnZhbHVlUHJvcGVydHlcIj48L3NlbGVjdD4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCIgbmctaWY9XCJjb21wb25lbnQuZGF0YVNyYyA9PSBcXCdyZXNvdXJjZVxcJyAmJiBjb21wb25lbnQudmFsdWVQcm9wZXJ0eSA9PT0gXFwnXFwnXCI+JyArXG4gICAgICAgICAgJyAgPGxhYmVsIGZvcj1cInBsYWNlaG9sZGVyXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJUaGUgcHJvcGVydGllcyBvbiB0aGUgcmVzb3VyY2UgdG8gcmV0dXJuIGFzIHBhcnQgb2YgdGhlIG9wdGlvbnMuIFNlcGFyYXRlIHByb3BlcnR5IG5hbWVzIGJ5IGNvbW1hcy4gSWYgbGVmdCBibGFuaywgYWxsIHByb3BlcnRpZXMgd2lsbCBiZSByZXR1cm5lZC5cIj5TZWxlY3QgRmllbGRzPC9sYWJlbD4nICtcbiAgICAgICAgICAnICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwic2VsZWN0RmllbGRzXCIgbmFtZT1cInNlbGVjdEZpZWxkc1wiIG5nLW1vZGVsPVwiY29tcG9uZW50LnNlbGVjdEZpZWxkc1wiIHBsYWNlaG9sZGVyPVwiQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgZmllbGRzIHRvIHNlbGVjdC5cIiB2YWx1ZT1cInt7IGNvbXBvbmVudC5zZWxlY3RGaWVsZHMgfX1cIj4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIG5nLXNob3c9XCJjb21wb25lbnQuZGF0YVNyYyA9PSBcXCd1cmxcXCcgfHwgY29tcG9uZW50LmRhdGFTcmMgPT0gXFwncmVzb3VyY2VcXCdcIiBwcm9wZXJ0eT1cInNlYXJjaEZpZWxkXCIgbGFiZWw9XCJTZWFyY2ggUXVlcnkgTmFtZVwiIHBsYWNlaG9sZGVyPVwiTmFtZSBvZiBVUkwgcXVlcnkgcGFyYW1ldGVyXCIgdGl0bGU9XCJUaGUgbmFtZSBvZiB0aGUgc2VhcmNoIHF1ZXJ5c3RyaW5nIHBhcmFtZXRlciB1c2VkIHdoZW4gc2VuZGluZyBhIHJlcXVlc3QgdG8gZmlsdGVyIHJlc3VsdHMgd2l0aC4gVGhlIHNlcnZlciBhdCB0aGUgVVJMIG11c3QgaGFuZGxlIHRoaXMgcXVlcnkgcGFyYW1ldGVyLlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gbmctc2hvdz1cImNvbXBvbmVudC5kYXRhU3JjID09IFxcJ3VybFxcJyB8fCBjb21wb25lbnQuZGF0YVNyYyA9PSBcXCdyZXNvdXJjZVxcJ1wiIHByb3BlcnR5PVwiZmlsdGVyXCIgbGFiZWw9XCJGaWx0ZXIgUXVlcnlcIiBwbGFjZWhvbGRlcj1cIlRoZSBmaWx0ZXIgcXVlcnkgZm9yIHJlc3VsdHMuXCIgdGl0bGU9XCJVc2UgdGhpcyB0byBwcm92aWRlIGFkZGl0aW9uYWwgZmlsdGVyaW5nIHVzaW5nIHF1ZXJ5IHBhcmFtZXRlcnMuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiIG5nLXNob3c9XCJjb21wb25lbnQuZGF0YVNyYyA9PSBcXCdjdXN0b21cXCdcIj4nICtcbiAgICAgICAgICAnICA8bGFiZWwgZm9yPVwiY3VzdG9tXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCJXcml0ZSBjdXN0b20gY29kZSB0byByZXR1cm4gdGhlIHZhbHVlIG9wdGlvbnMuIFRoZSBmb3JtIGRhdGEgb2JqZWN0IGlzIGF2YWlsYWJsZS5cIj5DdXN0b20gVmFsdWVzPC9sYWJlbD4nICtcbiAgICAgICAgICAnICA8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiByb3dzPVwiMTBcIiBpZD1cImN1c3RvbVwiIG5hbWU9XCJjdXN0b21cIiBuZy1tb2RlbD1cImNvbXBvbmVudC5kYXRhLmN1c3RvbVwiIHBsYWNlaG9sZGVyPVwiLyoqKiBFeGFtcGxlIENvZGUgKioqL1xcbnZhbHVlcyA9IGRhdGFbXFwnbXlrZXlcXCddO1wiPnt7IGNvbXBvbmVudC5kYXRhLmN1c3RvbSB9fTwvdGV4dGFyZWE+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCJwbGFjZWhvbGRlclwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIEhUTUwgdGVtcGxhdGUgZm9yIHRoZSByZXN1bHQgZGF0YSBpdGVtcy5cIj5JdGVtIFRlbXBsYXRlPC9sYWJlbD4nICtcbiAgICAgICAgICAgICc8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInRlbXBsYXRlXCIgbmFtZT1cInRlbXBsYXRlXCIgbmctbW9kZWw9XCJjb21wb25lbnQudGVtcGxhdGVcIiByb3dzPVwiM1wiPnt7IGNvbXBvbmVudC50ZW1wbGF0ZSB9fTwvdGV4dGFyZWE+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiIG5nLWhpZGU9XCJjb21wb25lbnQuZGF0YVNyYyA9PSBcXCd2YWx1ZXNcXCcgfHwgY29tcG9uZW50LmRhdGFTcmMgPT0gXFwnanNvblxcJ1wiPicgK1xuICAgICAgICAgICcgIDxsYWJlbCBmb3I9XCJwbGFjZWhvbGRlclwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiUmVmcmVzaCBkYXRhIHdoZW4gYW5vdGhlciBmaWVsZCBjaGFuZ2VzLlwiPlJlZnJlc2ggT248L2xhYmVsPicgK1xuICAgICAgICAgICcgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInJlZnJlc2hPblwiIG5hbWU9XCJyZWZyZXNoT25cIiBuZy1vcHRpb25zPVwiZmllbGQua2V5IGFzIGZpZWxkLmxhYmVsIGZvciBmaWVsZCBpbiBmb3JtRmllbGRzXCIgbmctbW9kZWw9XCJjb21wb25lbnQucmVmcmVzaE9uXCI+PC9zZWxlY3Q+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBuZy1zaG93PVwiY29tcG9uZW50LmRhdGFTcmMgPT0gXFwncmVzb3VyY2VcXCcgfHwgY29tcG9uZW50LmRhdGFTcmMgPT0gXFwndXJsXFwnIHx8IGNvbXBvbmVudC5kYXRhU3JjID09IFxcJ2N1c3RvbVxcJ1wiIHByb3BlcnR5PVwiY2xlYXJPblJlZnJlc2hcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIG5nLXNob3c9XCJjb21wb25lbnQuZGF0YVNyYyA9PSBcXCd1cmxcXCdcIiBwcm9wZXJ0eT1cImF1dGhlbnRpY2F0ZVwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkZWZhdWx0VmFsdWVcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBBUEkgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9zZWxlY3QvdmFsaWRhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5yZXF1aXJlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ1bmlxdWVcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPjwvZm9ybS1idWlsZGVyLW9wdGlvbi1jdXN0b20tdmFsaWRhdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3Rlcignc2VsZWN0Ym94ZXMnLCB7XG4gICAgICAgIGljb246ICdmYSBmYS1wbHVzLXNxdWFyZScsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9zZWxlY3Rib3hlcy9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdGJveGVzL3ZhbGlkYXRlLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQVBJJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvc2VsZWN0Ym94ZXMvYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI3NlbGVjdGJveGVzJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdGJveGVzL2Rpc3BsYXkuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJsYWJlbFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPHZhbHVlLWJ1aWxkZXIgZGF0YT1cImNvbXBvbmVudC52YWx1ZXNcIiBsYWJlbD1cIlNlbGVjdCBCb3hlc1wiIHRvb2x0aXAtdGV4dD1cIkNoZWNrYm94ZXMgdG8gZGlzcGxheS4gTGFiZWxzIGFyZSBzaG93biBpbiB0aGUgZm9ybS4gVmFsdWVzIGFyZSB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMgc2F2ZWQgd2l0aCB0aGUgc3VibWlzc2lvbi5cIj48L3ZhbHVlLWJ1aWxkZXI+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidGFiaW5kZXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiaW5saW5lXCIgdHlwZT1cImNoZWNrYm94XCIgbGFiZWw9XCJJbmxpbmUgTGF5b3V0XCIgdGl0bGU9XCJEaXNwbGF5cyB0aGUgY2hlY2tib3hlcyBob3Jpem9udGFsbHkuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIEFQSSBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdGJveGVzL2FwaS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbi1rZXk+PC9mb3JtLWJ1aWxkZXItb3B0aW9uLWtleT4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIEFQSSBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3NlbGVjdGJveGVzL3ZhbGlkYXRlLmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUucmVxdWlyZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPjwvZm9ybS1idWlsZGVyLW9wdGlvbi1jdXN0b20tdmFsaWRhdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3Rlcignc2lnbmF0dXJlJywge1xuICAgICAgICBpY29uOiAnZmEgZmEtcGVuY2lsJyxcbiAgICAgICAgdmlld3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnRGlzcGxheScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3NpZ25hdHVyZS9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnVmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL3NpZ25hdHVyZS92YWxpZGF0ZS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdMYXlvdXQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vbGF5b3V0Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29uZGl0aW9uYWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vY29uZGl0aW9uYWwuaHRtbCdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jc2lnbmF0dXJlJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBzZXR0aW5ncyBtYXJrdXAuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3NpZ25hdHVyZS9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZm9vdGVyXCIgbGFiZWw9XCJGb290ZXIgTGFiZWxcIiBwbGFjZWhvbGRlcj1cIkZvb3RlciBMYWJlbFwiIHRpdGxlPVwiVGhlIGZvb3RlciB0ZXh0IHRoYXQgYXBwZWFycyBiZWxvdyB0aGUgc2lnbmF0dXJlIGFyZWEuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cIndpZHRoXCIgbGFiZWw9XCJXaWR0aFwiIHBsYWNlaG9sZGVyPVwiV2lkdGhcIiB0aXRsZT1cIlRoZSB3aWR0aCBvZiB0aGUgc2lnbmF0dXJlIGFyZWEuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImhlaWdodFwiIGxhYmVsPVwiSGVpZ2h0XCIgcGxhY2Vob2xkZXI9XCJIZWlnaHRcIiB0aXRsZT1cIlRoZSBoZWlnaHQgb2YgdGhlIHNpZ25hdHVyZSBhcmVhLlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJiYWNrZ3JvdW5kQ29sb3JcIiBsYWJlbD1cIkJhY2tncm91bmQgQ29sb3JcIiBwbGFjZWhvbGRlcj1cIkJhY2tncm91bmQgQ29sb3JcIiB0aXRsZT1cIlRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBzaWduYXR1cmUgYXJlYS5cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGVuQ29sb3JcIiBsYWJlbD1cIlBlbiBDb2xvclwiIHBsYWNlaG9sZGVyPVwiUGVuIENvbG9yXCIgdGl0bGU9XCJUaGUgaW5rIGNvbG9yIGZvciB0aGUgc2lnbmF0dXJlIGFyZWEuXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIFZhbGlkYXRpb24gbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9zaWduYXR1cmUvdmFsaWRhdGUuaHRtbCcsXG4gICAgICAgICc8bmctZm9ybT4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5yZXF1aXJlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3Rlcignc3VydmV5Jywge1xuICAgICAgICBpY29uOiAnZmEgZmEtbGlzdCcsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9zdXJ2ZXkvZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1ZhbGlkYXRpb24nLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9zdXJ2ZXkvdmFsaWRhdGUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI3N1cnZleSdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy9zdXJ2ZXkvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxhYmVsXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8dmFsdWUtYnVpbGRlciBkYXRhPVwiY29tcG9uZW50LnF1ZXN0aW9uc1wiIGRlZmF1bHQ9XCJjb21wb25lbnQucXVlc3Rpb25zXCIgbGFiZWw9XCJRdWVzdGlvbnNcIiB0b29sdGlwLXRleHQ9XCJUaGUgcXVlc3Rpb25zIHlvdSB3b3VsZCBsaWtlIHRvIGFzIGluIHRoaXMgc3VydmV5IHF1ZXN0aW9uLlwiPjwvdmFsdWUtYnVpbGRlcj4nICtcbiAgICAgICAgICAnPHZhbHVlLWJ1aWxkZXIgZGF0YT1cImNvbXBvbmVudC52YWx1ZXNcIiBkZWZhdWx0PVwiY29tcG9uZW50LnZhbHVlc1wiIGxhYmVsPVwiVmFsdWVzXCIgdG9vbHRpcC10ZXh0PVwiVGhlIHZhbHVlcyB0aGF0IGNhbiBiZSBzZWxlY3RlZCBwZXIgcXVlc3Rpb24uIEV4YW1wbGU6IFxcJ1NhdGlzZmllZFxcJywgXFwnVmVyeSBTYXRpc2ZpZWRcXCcsIGV0Yy5cIj48L3ZhbHVlLWJ1aWxkZXI+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiZGVmYXVsdFZhbHVlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImlubGluZVwiIHR5cGU9XCJjaGVja2JveFwiIGxhYmVsPVwiSW5saW5lIExheW91dFwiIHRpdGxlPVwiRGlzcGxheXMgdGhlIHJhZGlvIGJ1dHRvbnMgaG9yaXpvbnRhbGx5LlwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcm90ZWN0ZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwicGVyc2lzdGVudFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJkaXNhYmxlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ0YWJsZVZpZXdcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICAgIC8vIENyZWF0ZSB0aGUgQVBJIG1hcmt1cC5cbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvc3VydmV5L3ZhbGlkYXRlLmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUucmVxdWlyZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPjwvZm9ybS1idWlsZGVyLW9wdGlvbi1jdXN0b20tdmFsaWRhdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3RlcigndGFibGUnLCB7XG4gICAgICAgIGZidGVtcGxhdGU6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvdGFibGUuaHRtbCcsXG4gICAgICAgIGRvY3VtZW50YXRpb246ICdodHRwOi8vaGVscC5mb3JtLmlvL3VzZXJndWlkZS8jdGFibGUnLFxuICAgICAgICBub0RuZE92ZXJsYXk6IHRydWUsXG4gICAgICAgIGNvbmZpcm1SZW1vdmU6IHRydWUsXG4gICAgICAgIGljb246ICdmYSBmYS10YWJsZScsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy90YWJsZS9kaXNwbGF5Lmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9jb25kaXRpb25hbC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgdmFyIHRhYmxlQ2xhc3NlcyA9IFwieyd0YWJsZS1zdHJpcGVkJzogY29tcG9uZW50LnN0cmlwZWQsIFwiO1xuICAgICAgdGFibGVDbGFzc2VzICs9IFwiJ3RhYmxlLWJvcmRlcmVkJzogY29tcG9uZW50LmJvcmRlcmVkLCBcIjtcbiAgICAgIHRhYmxlQ2xhc3NlcyArPSBcIid0YWJsZS1ob3Zlcic6IGNvbXBvbmVudC5ob3ZlciwgXCI7XG4gICAgICB0YWJsZUNsYXNzZXMgKz0gXCIndGFibGUtY29uZGVuc2VkJzogY29tcG9uZW50LmNvbmRlbnNlZH1cIjtcbiAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2Zvcm1idWlsZGVyL3RhYmxlLmh0bWwnLFxuICAgICAgICAnPGRpdiBjbGFzcz1cInRhYmxlLXJlc3BvbnNpdmVcIj4nICtcbiAgICAgICAgICAnPHRhYmxlIG5nLWNsYXNzPVwiJyArIHRhYmxlQ2xhc3NlcyArICdcIiBjbGFzcz1cInRhYmxlXCI+JyArXG4gICAgICAgICAgICAnPHRoZWFkIG5nLWlmPVwiY29tcG9uZW50LmhlYWRlci5sZW5ndGhcIj48dHI+JyArXG4gICAgICAgICAgICAgICc8dGggbmctcmVwZWF0PVwiaGVhZGVyIGluIGNvbXBvbmVudC5oZWFkZXJcIj57eyBoZWFkZXIgfX08L3RoPicgK1xuICAgICAgICAgICAgJzwvdHI+PC90aGVhZD4nICtcbiAgICAgICAgICAgICc8dGJvZHk+JyArXG4gICAgICAgICAgICAgICc8dHIgbmctcmVwZWF0PVwicm93IGluIGNvbXBvbmVudC5yb3dzXCI+JyArXG4gICAgICAgICAgICAgICAgJzx0ZCBuZy1yZXBlYXQ9XCJjb21wb25lbnQgaW4gcm93XCI+JyArXG4gICAgICAgICAgICAgICAgICAnPGZvcm0tYnVpbGRlci1saXN0IGNvbXBvbmVudD1cImNvbXBvbmVudFwiIGZvcm09XCJmb3JtXCIgZm9ybWlvPVwiOjpmb3JtaW9cIj48L2Zvcm0tYnVpbGRlci1saXN0PicgK1xuICAgICAgICAgICAgICAgICc8L3RkPicgK1xuICAgICAgICAgICAgICAnPC90cj4nICtcbiAgICAgICAgICAgICc8L3Rib2R5PicgK1xuICAgICAgICAgICc8L3RhYmxlPicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgICAgKTtcblxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy90YWJsZS9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItdGFibGU+PC9mb3JtLWJ1aWxkZXItdGFibGU+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwic3RyaXBlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJib3JkZXJlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJob3ZlclwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJjb25kZW5zZWRcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8L25nLWZvcm0+J1xuICAgICAgKTtcbiAgICB9XG4gIF0pO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhbXG4gICAgJ2Zvcm1pb0NvbXBvbmVudHNQcm92aWRlcicsXG4gICAgZnVuY3Rpb24oZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyKSB7XG4gICAgICBmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIucmVnaXN0ZXIoJ3RleHRhcmVhJywge1xuICAgICAgICBpY29uOiAnZmEgZmEtZm9udCcsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy90ZXh0ZmllbGQvZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vZGF0YS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1ZhbGlkYXRpb24nLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy90ZXh0ZmllbGQvdmFsaWRhdGUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI3RleHRhcmVhJ1xuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoW1xuICAgICdmb3JtaW9Db21wb25lbnRzUHJvdmlkZXInLFxuICAgIGZ1bmN0aW9uKGZvcm1pb0NvbXBvbmVudHNQcm92aWRlcikge1xuICAgICAgZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyLnJlZ2lzdGVyKCd0ZXh0ZmllbGQnLCB7XG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy90ZXh0ZmllbGQvZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vZGF0YS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1ZhbGlkYXRpb24nLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy90ZXh0ZmllbGQvdmFsaWRhdGUuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBUEknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vYXBpLmh0bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTGF5b3V0JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2xheW91dC5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbmRpdGlvbmFsJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29tbW9uL2NvbmRpdGlvbmFsLmh0bWwnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI3RleHRmaWVsZCdcbiAgICAgIH0pO1xuICAgIH1cbiAgXSk7XG4gIGFwcC5ydW4oW1xuICAgICckdGVtcGxhdGVDYWNoZScsXG4gICAgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2V0dGluZ3MgbWFya3VwLlxuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vY29tcG9uZW50cy90ZXh0ZmllbGQvZGlzcGxheS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImxhYmVsXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInBsYWNlaG9sZGVyXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRlc2NyaXB0aW9uXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImlucHV0TWFza1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwcmVmaXhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwic3VmZml4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImN1c3RvbUNsYXNzXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmluZGV4XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cIm11bHRpcGxlXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInByb3RlY3RlZFwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJwZXJzaXN0ZW50XCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cImRpc2FibGVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInRhYmxlVmlld1wiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuXG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL3RleHRmaWVsZC92YWxpZGF0ZS5odG1sJyxcbiAgICAgICAgJzxuZy1mb3JtPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLnJlcXVpcmVkXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInVuaXF1ZVwiPjwvZm9ybS1idWlsZGVyLW9wdGlvbj4nICtcbiAgICAgICAgICAnPGZvcm0tYnVpbGRlci1vcHRpb24gcHJvcGVydHk9XCJ2YWxpZGF0ZS5taW5MZW5ndGhcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwidmFsaWRhdGUubWF4TGVuZ3RoXCI+PC9mb3JtLWJ1aWxkZXItb3B0aW9uPicgK1xuICAgICAgICAgICc8Zm9ybS1idWlsZGVyLW9wdGlvbiBwcm9wZXJ0eT1cInZhbGlkYXRlLnBhdHRlcm5cIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uLWN1c3RvbS12YWxpZGF0aW9uPjwvZm9ybS1idWlsZGVyLW9wdGlvbi1jdXN0b20tdmFsaWRhdGlvbj4nICtcbiAgICAgICAgJzwvbmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKFtcbiAgICAnZm9ybWlvQ29tcG9uZW50c1Byb3ZpZGVyJyxcbiAgICBmdW5jdGlvbihmb3JtaW9Db21wb25lbnRzUHJvdmlkZXIpIHtcbiAgICAgIGZvcm1pb0NvbXBvbmVudHNQcm92aWRlci5yZWdpc3Rlcignd2VsbCcsIHtcbiAgICAgICAgZmJ0ZW1wbGF0ZTogJ2Zvcm1pby9mb3JtYnVpbGRlci93ZWxsLmh0bWwnLFxuICAgICAgICBpY29uOiAnZmEgZmEtc3F1YXJlLW8nLFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnaHR0cDovL2hlbHAuZm9ybS5pby91c2VyZ3VpZGUvI3dlbGwnLFxuICAgICAgICBub0RuZE92ZXJsYXk6IHRydWUsXG4gICAgICAgIGNvbmZpcm1SZW1vdmU6IHRydWUsXG4gICAgICAgIHZpZXdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0Rpc3BsYXknLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9jb21tb24vZGlzcGxheS5odG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0FQSScsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9hcGkuaHRtbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9jb25kaXRpb25hbC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgfVxuICBdKTtcbiAgYXBwLnJ1bihbXG4gICAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vZm9ybWJ1aWxkZXIvd2VsbC5odG1sJyxcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ3ZWxsXCI+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItbGlzdCBjb21wb25lbnQ9XCJjb21wb25lbnRcIiBmb3JtPVwiZm9ybVwiIGZvcm1pbz1cIjo6Zm9ybWlvXCI+PC9mb3JtLWJ1aWxkZXItbGlzdD4nICtcbiAgICAgICAgJzwvZGl2PidcbiAgICAgICk7XG4gICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9jb21wb25lbnRzL2NvbW1vbi9kaXNwbGF5Lmh0bWwnLFxuICAgICAgICAnPG5nLWZvcm0+JyArXG4gICAgICAgICAgJzxmb3JtLWJ1aWxkZXItb3B0aW9uIHByb3BlcnR5PVwiY3VzdG9tQ2xhc3NcIj48L2Zvcm0tYnVpbGRlci1vcHRpb24+JyArXG4gICAgICAgICc8bmctZm9ybT4nXG4gICAgICApO1xuICAgIH1cbiAgXSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAgKiBUaGVzZSBhcmUgY29tcG9uZW50IG9wdGlvbnMgdGhhdCBjYW4gYmUgcmV1c2VkXG4gICogd2l0aCB0aGUgYnVpbGRlci1vcHRpb24gZGlyZWN0aXZlXG4gICogVmFsaWQgcHJvcGVydGllczogbGFiZWwsIHBsYWNlaG9sZGVyLCB0b29sdGlwLCB0eXBlXG4gICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbGFiZWw6IHtcbiAgICBsYWJlbDogJ0xhYmVsJyxcbiAgICBwbGFjZWhvbGRlcjogJ0ZpZWxkIExhYmVsJyxcbiAgICB0b29sdGlwOiAnVGhlIGxhYmVsIGZvciB0aGlzIGZpZWxkIHRoYXQgd2lsbCBhcHBlYXIgbmV4dCB0byBpdC4nXG4gIH0sXG4gIGRlZmF1bHRWYWx1ZToge1xuICAgIGxhYmVsOiAnRGVmYXVsdCBWYWx1ZScsXG4gICAgcGxhY2Vob2xkZXI6ICdEZWZhdWx0IFZhbHVlJyxcbiAgICB0b29sdGlwOiAnVGhlIHdpbGwgYmUgdGhlIHZhbHVlIGZvciB0aGlzIGZpZWxkLCBiZWZvcmUgdXNlciBpbnRlcmFjdGlvbi4gSGF2aW5nIGEgZGVmYXVsdCB2YWx1ZSB3aWxsIG92ZXJyaWRlIHRoZSBwbGFjZWhvbGRlciB0ZXh0LidcbiAgfSxcbiAgcGxhY2Vob2xkZXI6IHtcbiAgICBsYWJlbDogJ1BsYWNlaG9sZGVyJyxcbiAgICBwbGFjZWhvbGRlcjogJ1BsYWNlaG9sZGVyJyxcbiAgICB0b29sdGlwOiAnVGhlIHBsYWNlaG9sZGVyIHRleHQgdGhhdCB3aWxsIGFwcGVhciB3aGVuIHRoaXMgZmllbGQgaXMgZW1wdHkuJ1xuICB9LFxuICBkZXNjcmlwdGlvbjoge1xuICAgIGxhYmVsOiAnRGVzY3JpcHRpb24nLFxuICAgIHBsYWNlaG9sZGVyOiAnRGVzY3JpcHRpb24gZm9yIHRoaXMgZmllbGQuJyxcbiAgICB0b29sdGlwOiAnVGhlIGRlc2NyaXB0aW9uIGlzIHRleHQgdGhhdCB3aWxsIGFwcGVhciBiZWxvdyB0aGUgaW5wdXQgZmllbGQuJ1xuICB9LFxuICBpbnB1dE1hc2s6IHtcbiAgICBsYWJlbDogJ0lucHV0IE1hc2snLFxuICAgIHBsYWNlaG9sZGVyOiAnSW5wdXQgTWFzaycsXG4gICAgdG9vbHRpcDogJ0FuIGlucHV0IG1hc2sgaGVscHMgdGhlIHVzZXIgd2l0aCBpbnB1dCBieSBlbnN1cmluZyBhIHByZWRlZmluZWQgZm9ybWF0Ljxicj48YnI+OTogbnVtZXJpYzxicj5hOiBhbHBoYWJldGljYWw8YnI+KjogYWxwaGFudW1lcmljPGJyPjxicj5FeGFtcGxlIHRlbGVwaG9uZSBtYXNrOiAoOTk5KSA5OTktOTk5OTxicj48YnI+U2VlIHRoZSA8YSB0YXJnZXQ9XFwnX2JsYW5rXFwnIGhyZWY9XFwnaHR0cHM6Ly9naXRodWIuY29tL1JvYmluSGVyYm90cy9qcXVlcnkuaW5wdXRtYXNrXFwnPmpxdWVyeS5pbnB1dG1hc2sgZG9jdW1lbnRhdGlvbjwvYT4gZm9yIG1vcmUgaW5mb3JtYXRpb24uPC9hPidcbiAgfSxcbiAgYXV0aGVudGljYXRlOiB7XG4gICAgbGFiZWw6ICdGb3JtaW8gQXV0aGVudGljYXRlJyxcbiAgICB0b29sdGlwOiAnQ2hlY2sgdGhpcyBpZiB5b3Ugd291bGQgbGlrZSB0byB1c2UgRm9ybWlvIEF1dGhlbnRpY2F0aW9uIHdpdGggdGhlIHJlcXVlc3QuJyxcbiAgICB0eXBlOiAnY2hlY2tib3gnXG4gIH0sXG4gIHRhYmxlVmlldzoge1xuICAgIGxhYmVsOiAnVGFibGUgVmlldycsXG4gICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICB0b29sdGlwOiAnU2hvd3MgdGhpcyB2YWx1ZSB3aXRoaW4gdGhlIHRhYmxlIHZpZXcgb2YgdGhlIHN1Ym1pc3Npb25zLidcbiAgfSxcbiAgcHJlZml4OiB7XG4gICAgbGFiZWw6ICdQcmVmaXgnLFxuICAgIHBsYWNlaG9sZGVyOiAnZXhhbXBsZSBcXCckXFwnLCBcXCdAXFwnJyxcbiAgICB0b29sdGlwOiAnVGhlIHRleHQgdG8gc2hvdyBiZWZvcmUgYSBmaWVsZC4nXG4gIH0sXG4gIHN1ZmZpeDoge1xuICAgIGxhYmVsOiAnU3VmZml4JyxcbiAgICBwbGFjZWhvbGRlcjogJ2V4YW1wbGUgXFwnJFxcJywgXFwnQFxcJycsXG4gICAgdG9vbHRpcDogJ1RoZSB0ZXh0IHRvIHNob3cgYWZ0ZXIgYSBmaWVsZC4nXG4gIH0sXG4gIG11bHRpcGxlOiB7XG4gICAgbGFiZWw6ICdNdWx0aXBsZSBWYWx1ZXMnLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgdG9vbHRpcDogJ0FsbG93cyBtdWx0aXBsZSB2YWx1ZXMgdG8gYmUgZW50ZXJlZCBmb3IgdGhpcyBmaWVsZC4nXG4gIH0sXG4gIGRpc2FibGVkOiB7XG4gICAgbGFiZWw6ICdEaXNhYmxlZCcsXG4gICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICB0b29sdGlwOiAnRGlzYWJsZSB0aGUgZm9ybSBpbnB1dC4nXG4gIH0sXG4gIGNsZWFyT25SZWZyZXNoOiB7XG4gICAgbGFiZWw6ICdDbGVhciBWYWx1ZSBPbiBSZWZyZXNoJyxcbiAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgIHRvb2x0aXA6ICdXaGVuIHRoZSBSZWZyZXNoIE9uIGZpZWxkIGlzIGNoYW5nZWQsIGNsZWFyIHRoZSBzZWxlY3RlZCB2YWx1ZS4nXG4gIH0sXG4gIHVuaXF1ZToge1xuICAgIGxhYmVsOiAnVW5pcXVlJyxcbiAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgIHRvb2x0aXA6ICdNYWtlcyBzdXJlIHRoZSBkYXRhIHN1Ym1pdHRlZCBmb3IgdGhpcyBmaWVsZCBpcyB1bmlxdWUsIGFuZCBoYXMgbm90IGJlZW4gc3VibWl0dGVkIGJlZm9yZS4nXG4gIH0sXG4gIHByb3RlY3RlZDoge1xuICAgIGxhYmVsOiAnUHJvdGVjdGVkJyxcbiAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgIHRvb2x0aXA6ICdBIHByb3RlY3RlZCBmaWVsZCB3aWxsIG5vdCBiZSByZXR1cm5lZCB3aGVuIHF1ZXJpZWQgdmlhIEFQSS4nXG4gIH0sXG4gIGltYWdlOiB7XG4gICAgbGFiZWw6ICdEaXNwbGF5IGFzIGltYWdlcycsXG4gICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICB0b29sdGlwOiAnSW5zdGVhZCBvZiBhIGxpc3Qgb2YgbGlua2VkIGZpbGVzLCBpbWFnZXMgd2lsbCBiZSByZW5kZXJlZCBpbiB0aGUgdmlldy4nXG4gIH0sXG4gIGltYWdlU2l6ZToge1xuICAgIGxhYmVsOiAnSW1hZ2UgU2l6ZScsXG4gICAgcGxhY2Vob2xkZXI6ICcxMDAnLFxuICAgIHRvb2x0aXA6ICdUaGUgaW1hZ2Ugc2l6ZSBmb3IgcHJldmlld2luZyBpbWFnZXMuJ1xuICB9LFxuICBwZXJzaXN0ZW50OiB7XG4gICAgbGFiZWw6ICdQZXJzaXN0ZW50JyxcbiAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgIHRvb2x0aXA6ICdBIHBlcnNpc3RlbnQgZmllbGQgd2lsbCBiZSBzdG9yZWQgaW4gZGF0YWJhc2Ugd2hlbiB0aGUgZm9ybSBpcyBzdWJtaXR0ZWQuJ1xuICB9LFxuICBibG9jazoge1xuICAgIGxhYmVsOiAnQmxvY2snLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgdG9vbHRpcDogJ1RoaXMgY29udHJvbCBzaG91bGQgc3BhbiB0aGUgZnVsbCB3aWR0aCBvZiB0aGUgYm91bmRpbmcgY29udGFpbmVyLidcbiAgfSxcbiAgbGVmdEljb246IHtcbiAgICBsYWJlbDogJ0xlZnQgSWNvbicsXG4gICAgcGxhY2Vob2xkZXI6ICdFbnRlciBpY29uIGNsYXNzZXMnLFxuICAgIHRvb2x0aXA6ICdUaGlzIGlzIHRoZSBmdWxsIGljb24gY2xhc3Mgc3RyaW5nIHRvIHNob3cgdGhlIGljb24uIEV4YW1wbGU6IFxcJ2dseXBoaWNvbiBnbHlwaGljb24tc2VhcmNoXFwnIG9yIFxcJ2ZhIGZhLXBsdXNcXCcnXG4gIH0sXG4gIHJpZ2h0SWNvbjoge1xuICAgIGxhYmVsOiAnUmlnaHQgSWNvbicsXG4gICAgcGxhY2Vob2xkZXI6ICdFbnRlciBpY29uIGNsYXNzZXMnLFxuICAgIHRvb2x0aXA6ICdUaGlzIGlzIHRoZSBmdWxsIGljb24gY2xhc3Mgc3RyaW5nIHRvIHNob3cgdGhlIGljb24uIEV4YW1wbGU6IFxcJ2dseXBoaWNvbiBnbHlwaGljb24tc2VhcmNoXFwnIG9yIFxcJ2ZhIGZhLXBsdXNcXCcnXG4gIH0sXG4gIHVybDoge1xuICAgIGxhYmVsOiAnVXBsb2FkIFVybCcsXG4gICAgcGxhY2Vob2xkZXI6ICdFbnRlciB0aGUgdXJsIHRvIHBvc3QgdGhlIGZpbGVzIHRvLicsXG4gICAgdG9vbHRpcDogJ1NlZSA8YSBocmVmPVxcJ2h0dHBzOi8vZ2l0aHViLmNvbS9kYW5pYWxmYXJpZC9uZy1maWxlLXVwbG9hZCNzZXJ2ZXItc2lkZVxcJyB0YXJnZXQ9XFwnX2JsYW5rXFwnPmh0dHBzOi8vZ2l0aHViLmNvbS9kYW5pYWxmYXJpZC9uZy1maWxlLXVwbG9hZCNzZXJ2ZXItc2lkZTwvYT4gZm9yIGhvdyB0byBzZXQgdXAgdGhlIHNlcnZlci4nXG4gIH0sXG4gIGRpcjoge1xuICAgIGxhYmVsOiAnRGlyZWN0b3J5JyxcbiAgICBwbGFjZWhvbGRlcjogJyhvcHRpb25hbCkgRW50ZXIgYSBkaXJlY3RvcnkgZm9yIHRoZSBmaWxlcycsXG4gICAgdG9vbHRpcDogJ1RoaXMgd2lsbCBwbGFjZSBhbGwgdGhlIGZpbGVzIHVwbG9hZGVkIGluIHRoaXMgZmllbGQgaW4gdGhlIGRpcmVjdG9yeSdcbiAgfSxcbiAgZGlzYWJsZU9uSW52YWxpZDoge1xuICAgIGxhYmVsOiAnRGlzYWJsZSBvbiBGb3JtIEludmFsaWQnLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgdG9vbHRpcDogJ1RoaXMgd2lsbCBkaXNhYmxlIHRoaXMgZmllbGQgaWYgdGhlIGZvcm0gaXMgaW52YWxpZC4nXG4gIH0sXG4gIHN0cmlwZWQ6IHtcbiAgICBsYWJlbDogJ1N0cmlwZWQnLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgdG9vbHRpcDogJ1RoaXMgd2lsbCBzdHJpcGUgdGhlIHRhYmxlIGlmIGNoZWNrZWQuJ1xuICB9LFxuICBib3JkZXJlZDoge1xuICAgIGxhYmVsOiAnQm9yZGVyZWQnLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgdG9vbHRpcDogJ1RoaXMgd2lsbCBib3JkZXIgdGhlIHRhYmxlIGlmIGNoZWNrZWQuJ1xuICB9LFxuICBob3Zlcjoge1xuICAgIGxhYmVsOiAnSG92ZXInLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgdG9vbHRpcDogJ0hpZ2hsaWdodCBhIHJvdyBvbiBob3Zlci4nXG4gIH0sXG4gIGNvbmRlbnNlZDoge1xuICAgIGxhYmVsOiAnQ29uZGVuc2VkJyxcbiAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgIHRvb2x0aXA6ICdDb25kZW5zZSB0aGUgc2l6ZSBvZiB0aGUgdGFibGUuJ1xuICB9LFxuICBkYXRhZ3JpZExhYmVsOiB7XG4gICAgbGFiZWw6ICdEYXRhZ3JpZCBMYWJlbCcsXG4gICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICB0b29sdGlwOiAnU2hvdyB0aGUgbGFiZWwgd2hlbiBpbiBhIGRhdGFncmlkLidcbiAgfSxcbiAgJ3ZhbGlkYXRlLnJlcXVpcmVkJzoge1xuICAgIGxhYmVsOiAnUmVxdWlyZWQnLFxuICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgdG9vbHRpcDogJ0EgcmVxdWlyZWQgZmllbGQgbXVzdCBiZSBmaWxsZWQgaW4gYmVmb3JlIHRoZSBmb3JtIGNhbiBiZSBzdWJtaXR0ZWQuJ1xuICB9LFxuICAndmFsaWRhdGUubWluTGVuZ3RoJzoge1xuICAgIGxhYmVsOiAnTWluaW11bSBMZW5ndGgnLFxuICAgIHBsYWNlaG9sZGVyOiAnTWluaW11bSBMZW5ndGgnLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICAgIHRvb2x0aXA6ICdUaGUgbWluaW11bSBsZW5ndGggcmVxdWlyZW1lbnQgdGhpcyBmaWVsZCBtdXN0IG1lZXQuJ1xuICB9LFxuICAndmFsaWRhdGUubWF4TGVuZ3RoJzoge1xuICAgIGxhYmVsOiAnTWF4aW11bSBMZW5ndGgnLFxuICAgIHBsYWNlaG9sZGVyOiAnTWF4aW11bSBMZW5ndGgnLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICAgIHRvb2x0aXA6ICdUaGUgbWF4aW11bSBsZW5ndGggcmVxdWlyZW1lbnQgdGhpcyBmaWVsZCBtdXN0IG1lZXQnXG4gIH0sXG4gICd2YWxpZGF0ZS5wYXR0ZXJuJzoge1xuICAgIGxhYmVsOiAnUmVndWxhciBFeHByZXNzaW9uIFBhdHRlcm4nLFxuICAgIHBsYWNlaG9sZGVyOiAnUmVndWxhciBFeHByZXNzaW9uIFBhdHRlcm4nLFxuICAgIHRvb2x0aXA6ICdUaGUgcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm4gdGVzdCB0aGF0IHRoZSBmaWVsZCB2YWx1ZSBtdXN0IHBhc3MgYmVmb3JlIHRoZSBmb3JtIGNhbiBiZSBzdWJtaXR0ZWQuJ1xuICB9LFxuICAnY3VzdG9tQ2xhc3MnOiB7XG4gICAgbGFiZWw6ICdDdXN0b20gQ1NTIENsYXNzJyxcbiAgICBwbGFjZWhvbGRlcjogJ0N1c3RvbSBDU1MgQ2xhc3MnLFxuICAgIHRvb2x0aXA6ICdDdXN0b20gQ1NTIGNsYXNzIHRvIGFkZCB0byB0aGlzIGNvbXBvbmVudC4nXG4gIH0sXG4gICd0YWJpbmRleCc6IHtcbiAgICBsYWJlbDogJ1RhYiBJbmRleCcsXG4gICAgcGxhY2Vob2xkZXI6ICdUYWIgSW5kZXgnLFxuICAgIHRvb2x0aXA6ICdTZXRzIHRoZSB0YWJpbmRleCBhdHRyaWJ1dGUgb2YgdGhpcyBjb21wb25lbnQgdG8gb3ZlcnJpZGUgdGhlIHRhYiBvcmRlciBvZiB0aGUgZm9ybS4gU2VlIHRoZSA8YSBocmVmPVxcJ2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUTUwvR2xvYmFsX2F0dHJpYnV0ZXMvdGFiaW5kZXhcXCc+TUROIGRvY3VtZW50YXRpb248L2E+IG9uIHRhYmluZGV4IGZvciBtb3JlIGluZm9ybWF0aW9uLidcbiAgfSxcbiAgJ2FkZEFub3RoZXInOiB7XG4gICAgbGFiZWw6ICdBZGQgQW5vdGhlciBUZXh0JyxcbiAgICBwbGFjZWhvbGRlcjogJ0FkZCBBbm90aGVyJyxcbiAgICB0b29sdGlwOiAnU2V0IHRoZSB0ZXh0IG9mIHRoZSBBZGQgQW5vdGhlciBidXR0b24uJ1xuICB9LFxuICAnZGVmYXVsdERhdGUnOiB7XG4gICAgbGFiZWw6ICdEZWZhdWx0IFZhbHVlJyxcbiAgICBwbGFjZWhvbGRlcjogJ0RlZmF1bHQgVmFsdWUnLFxuICAgIHRvb2x0aXA6ICdZb3UgY2FuIHVzZSBNb21lbnQuanMgZnVuY3Rpb25zIHRvIHNldCB0aGUgZGVmYXVsdCB2YWx1ZSB0byBhIHNwZWNpZmljIGRhdGUuIEZvciBleGFtcGxlOiBcXG4gXFxuIG1vbWVudCgpLnN1YnRyYWN0KDEwLCBcXCdkYXlzXFwnKS5jYWxlbmRhcigpOydcbiAgfSxcbiAgLy8gTmVlZCB0byB1c2UgYXJyYXkgbm90YXRpb24gdG8gaGF2ZSBkYXNoIGluIG5hbWVcbiAgJ3N0eWxlW1xcJ21hcmdpbi10b3BcXCddJzoge1xuICAgIGxhYmVsOiAnTWFyZ2luIFRvcCcsXG4gICAgcGxhY2Vob2xkZXI6ICcwcHgnLFxuICAgIHRvb2x0aXA6ICdTZXRzIHRoZSB0b3AgbWFyZ2luIG9mIHRoaXMgY29tcG9uZW50LiBNdXN0IGJlIGEgdmFsaWQgQ1NTIG1lYXN1cmVtZW50IGxpa2UgYDEwcHhgLidcbiAgfSxcbiAgJ3N0eWxlW1xcJ21hcmdpbi1yaWdodFxcJ10nOiB7XG4gICAgbGFiZWw6ICdNYXJnaW4gUmlnaHQnLFxuICAgIHBsYWNlaG9sZGVyOiAnMHB4JyxcbiAgICB0b29sdGlwOiAnU2V0cyB0aGUgcmlnaHQgbWFyZ2luIG9mIHRoaXMgY29tcG9uZW50LiBNdXN0IGJlIGEgdmFsaWQgQ1NTIG1lYXN1cmVtZW50IGxpa2UgYDEwcHhgLidcbiAgfSxcbiAgJ3N0eWxlW1xcJ21hcmdpbi1ib3R0b21cXCddJzoge1xuICAgIGxhYmVsOiAnTWFyZ2luIEJvdHRvbScsXG4gICAgcGxhY2Vob2xkZXI6ICcwcHgnLFxuICAgIHRvb2x0aXA6ICdTZXRzIHRoZSBib3R0b20gbWFyZ2luIG9mIHRoaXMgY29tcG9uZW50LiBNdXN0IGJlIGEgdmFsaWQgQ1NTIG1lYXN1cmVtZW50IGxpa2UgYDEwcHhgLidcbiAgfSxcbiAgJ3N0eWxlW1xcJ21hcmdpbi1sZWZ0XFwnXSc6IHtcbiAgICBsYWJlbDogJ01hcmdpbiBMZWZ0JyxcbiAgICBwbGFjZWhvbGRlcjogJzBweCcsXG4gICAgdG9vbHRpcDogJ1NldHMgdGhlIGxlZnQgbWFyZ2luIG9mIHRoaXMgY29tcG9uZW50LiBNdXN0IGJlIGEgdmFsaWQgQ1NTIG1lYXN1cmVtZW50IGxpa2UgYDEwcHhgLidcbiAgfVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGlvbnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiAnc3VibWl0JyxcbiAgICAgIHRpdGxlOiAnU3VibWl0J1xuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2V2ZW50JyxcbiAgICAgIHRpdGxlOiAnRXZlbnQnXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAncmVzZXQnLFxuICAgICAgdGl0bGU6ICdSZXNldCdcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdvYXV0aCcsXG4gICAgICB0aXRsZTogJ09BdXRoJ1xuICAgIH1cbiAgXSxcbiAgdGhlbWVzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ2RlZmF1bHQnLFxuICAgICAgdGl0bGU6ICdEZWZhdWx0J1xuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3ByaW1hcnknLFxuICAgICAgdGl0bGU6ICdQcmltYXJ5J1xuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2luZm8nLFxuICAgICAgdGl0bGU6ICdJbmZvJ1xuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3N1Y2Nlc3MnLFxuICAgICAgdGl0bGU6ICdTdWNjZXNzJ1xuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2RhbmdlcicsXG4gICAgICB0aXRsZTogJ0RhbmdlcidcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICd3YXJuaW5nJyxcbiAgICAgIHRpdGxlOiAnV2FybmluZydcbiAgICB9XG4gIF0sXG4gIHNpemVzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ3hzJyxcbiAgICAgIHRpdGxlOiAnRXh0cmEgU21hbGwnXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnc20nLFxuICAgICAgdGl0bGU6ICdTbWFsbCdcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdtZCcsXG4gICAgICB0aXRsZTogJ01lZGl1bSdcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdsZycsXG4gICAgICB0aXRsZTogJ0xhcmdlJ1xuICAgIH1cbiAgXVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyplc2xpbnQgbWF4LXN0YXRlbWVudHM6IDAqL1xubW9kdWxlLmV4cG9ydHMgPSBbJ2RlYm91bmNlJywgZnVuY3Rpb24oZGVib3VuY2UpIHtcbiAgcmV0dXJuIHtcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHRlbXBsYXRlVXJsOiAnZm9ybWlvL2Zvcm1idWlsZGVyL2J1aWxkZXIuaHRtbCcsXG4gICAgc2NvcGU6IHtcbiAgICAgIGZvcm06ICc9PycsXG4gICAgICBzcmM6ICc9JyxcbiAgICAgIHR5cGU6ICc9JyxcbiAgICAgIG9uU2F2ZTogJz0nLFxuICAgICAgb25DYW5jZWw6ICc9JyxcbiAgICAgIG9wdGlvbnM6ICc9PydcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IFtcbiAgICAgICckc2NvcGUnLFxuICAgICAgJ2Zvcm1pb0NvbXBvbmVudHMnLFxuICAgICAgJ25nRGlhbG9nJyxcbiAgICAgICdGb3JtaW8nLFxuICAgICAgJ0Zvcm1pb1V0aWxzJyxcbiAgICAgICdkbmREcmFnSWZyYW1lV29ya2Fyb3VuZCcsXG4gICAgICAnJGludGVydmFsJyxcbiAgICAgIGZ1bmN0aW9uKFxuICAgICAgICAkc2NvcGUsXG4gICAgICAgIGZvcm1pb0NvbXBvbmVudHMsXG4gICAgICAgIG5nRGlhbG9nLFxuICAgICAgICBGb3JtaW8sXG4gICAgICAgIEZvcm1pb1V0aWxzLFxuICAgICAgICBkbmREcmFnSWZyYW1lV29ya2Fyb3VuZCxcbiAgICAgICAgJGludGVydmFsXG4gICAgICApIHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMgPSAkc2NvcGUub3B0aW9ucyB8fCB7fTtcblxuICAgICAgICAvLyBBZGQgdGhlIGNvbXBvbmVudHMgdG8gdGhlIHNjb3BlLlxuICAgICAgICB2YXIgc3VibWl0QnV0dG9uID0gYW5ndWxhci5jb3B5KGZvcm1pb0NvbXBvbmVudHMuY29tcG9uZW50cy5idXR0b24uc2V0dGluZ3MpO1xuICAgICAgICBpZiAoISRzY29wZS5mb3JtKSB7XG4gICAgICAgICAgJHNjb3BlLmZvcm0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISRzY29wZS5mb3JtLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAkc2NvcGUuZm9ybS5jb21wb25lbnRzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEkc2NvcGUub3B0aW9ucy5ub1N1Ym1pdCAmJiAhJHNjb3BlLmZvcm0uY29tcG9uZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAkc2NvcGUuZm9ybS5jb21wb25lbnRzLnB1c2goc3VibWl0QnV0dG9uKTtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUuaGlkZUNvdW50ID0gMjtcbiAgICAgICAgJHNjb3BlLmZvcm0ucGFnZSA9IDA7XG4gICAgICAgICRzY29wZS5mb3JtaW8gPSAkc2NvcGUuc3JjID8gbmV3IEZvcm1pbygkc2NvcGUuc3JjKSA6IG51bGw7XG5cbiAgICAgICAgdmFyIHNldE51bVBhZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCEkc2NvcGUuZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJHNjb3BlLmZvcm0uZGlzcGxheSAhPT0gJ3dpemFyZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgbnVtUGFnZXMgPSAwO1xuICAgICAgICAgICRzY29wZS5mb3JtLmNvbXBvbmVudHMuZm9yRWFjaChmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQudHlwZSA9PT0gJ3BhbmVsJykge1xuICAgICAgICAgICAgICBudW1QYWdlcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgJHNjb3BlLmZvcm0ubnVtUGFnZXMgPSBudW1QYWdlcztcblxuICAgICAgICAgIC8vIEFkZCBhIHBhZ2UgaWYgbm9uZSBpcyBmb3VuZC5cbiAgICAgICAgICBpZiAobnVtUGFnZXMgPT09IDApIHtcbiAgICAgICAgICAgICRzY29wZS5uZXdQYWdlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBwYWdlIGRvZXNuJ3QgZXhjZWRlIHRoZSBlbmQuXG4gICAgICAgICAgaWYgKChudW1QYWdlcyA+IDApICYmICgkc2NvcGUuZm9ybS5wYWdlID49IG51bVBhZ2VzKSkge1xuICAgICAgICAgICAgJHNjb3BlLmZvcm0ucGFnZSA9IG51bVBhZ2VzIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gTG9hZCB0aGUgZm9ybS5cbiAgICAgICAgaWYgKCRzY29wZS5mb3JtaW8gJiYgJHNjb3BlLmZvcm1pby5mb3JtSWQpIHtcbiAgICAgICAgICAkc2NvcGUuZm9ybWlvLmxvYWRGb3JtKCkudGhlbihmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgICAgICAkc2NvcGUuZm9ybSA9IGZvcm07XG4gICAgICAgICAgICAkc2NvcGUuZm9ybS5wYWdlID0gMDtcbiAgICAgICAgICAgIGlmICghJHNjb3BlLm9wdGlvbnMubm9TdWJtaXQgJiYgJHNjb3BlLmZvcm0uY29tcG9uZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmZvcm0uY29tcG9uZW50cy5wdXNoKHN1Ym1pdEJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuJHdhdGNoKCdmb3JtLmRpc3BsYXknLCBmdW5jdGlvbihkaXNwbGF5KSB7XG4gICAgICAgICAgJHNjb3BlLmhpZGVDb3VudCA9IChkaXNwbGF5ID09PSAnd2l6YXJkJykgPyAxIDogMjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZXkgY2FuIHN3aXRjaCBiYWNrIGFuZCBmb3J0aCBiZXR3ZWVuIHdpemFyZCBhbmQgcGFnZXMuXG4gICAgICAgICRzY29wZS4kb24oJ2Zvcm1EaXNwbGF5JywgZnVuY3Rpb24oZXZlbnQsIGRpc3BsYXkpIHtcbiAgICAgICAgICAkc2NvcGUuZm9ybS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgICAkc2NvcGUuZm9ybS5wYWdlID0gMDtcbiAgICAgICAgICBzZXROdW1QYWdlcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZXR1cm4gdGhlIGZvcm0gcGFnZXMuXG4gICAgICAgICRzY29wZS5wYWdlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBwYWdlcyA9IFtdO1xuICAgICAgICAgICRzY29wZS5mb3JtLmNvbXBvbmVudHMuZm9yRWFjaChmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQudHlwZSA9PT0gJ3BhbmVsJykge1xuICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgcGFnZXMucHVzaChjb21wb25lbnQudGl0bGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhZ2VzLnB1c2goJ1BhZ2UgJyArIChwYWdlcy5sZW5ndGggKyAxKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gcGFnZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU2hvdyB0aGUgZm9ybSBwYWdlLlxuICAgICAgICAkc2NvcGUuc2hvd1BhZ2UgPSBmdW5jdGlvbihwYWdlKSB7XG4gICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAkc2NvcGUuZm9ybS5jb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gJHNjb3BlLmZvcm0uY29tcG9uZW50c1tpXTtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQudHlwZSA9PT0gJ3BhbmVsJykge1xuICAgICAgICAgICAgICBpZiAoaSA9PT0gcGFnZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgICRzY29wZS5mb3JtLnBhZ2UgPSBpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5uZXdQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLmZvcm0ubnVtUGFnZXM7XG4gICAgICAgICAgdmFyIHBhZ2VOdW0gPSBpbmRleCArIDE7XG4gICAgICAgICAgdmFyIGNvbXBvbmVudCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdwYW5lbCcsXG4gICAgICAgICAgICB0aXRsZTogJ1BhZ2UgJyArIHBhZ2VOdW0sXG4gICAgICAgICAgICBpc05ldzogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFtdLFxuICAgICAgICAgICAgaW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAga2V5OiAncGFnZScgKyBwYWdlTnVtXG4gICAgICAgICAgfTtcbiAgICAgICAgICAkc2NvcGUuZm9ybS5udW1QYWdlcysrO1xuICAgICAgICAgICRzY29wZS5mb3JtLmNvbXBvbmVudHMuc3BsaWNlKGluZGV4LCAwLCBjb21wb25lbnQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgbnVtYmVyIG9mIHBhZ2VzIGlzIGFsd2F5cyBjb3JyZWN0LlxuICAgICAgICAkc2NvcGUuJHdhdGNoKCdmb3JtLmNvbXBvbmVudHMubGVuZ3RoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2V0TnVtUGFnZXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmZvcm1Db21wb25lbnRzID0gXy5jbG9uZURlZXAoZm9ybWlvQ29tcG9uZW50cy5jb21wb25lbnRzKTtcbiAgICAgICAgXy5lYWNoKCRzY29wZS5mb3JtQ29tcG9uZW50cywgZnVuY3Rpb24oY29tcG9uZW50LCBrZXkpIHtcbiAgICAgICAgICBjb21wb25lbnQuc2V0dGluZ3MuaXNOZXcgPSB0cnVlO1xuICAgICAgICAgIGlmIChjb21wb25lbnQuc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2J1aWxkZXInKSAmJiAhY29tcG9uZW50LnNldHRpbmdzLmJ1aWxkZXIgfHwgY29tcG9uZW50LmRpc2FibGVkKSB7XG4gICAgICAgICAgICBkZWxldGUgJHNjb3BlLmZvcm1Db21wb25lbnRzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuZm9ybUNvbXBvbmVudEdyb3VwcyA9IF8uY2xvbmVEZWVwKF8ub21pdEJ5KGZvcm1pb0NvbXBvbmVudHMuZ3JvdXBzLCAnZGlzYWJsZWQnKSk7XG4gICAgICAgICRzY29wZS5mb3JtQ29tcG9uZW50c0J5R3JvdXAgPSBfLmdyb3VwQnkoJHNjb3BlLmZvcm1Db21wb25lbnRzLCBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgICByZXR1cm4gY29tcG9uZW50Lmdyb3VwO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZXQgdGhlIHJlc291cmNlIGZpZWxkcy5cbiAgICAgICAgdmFyIHJlc291cmNlRW5hYmxlZCA9ICFmb3JtaW9Db21wb25lbnRzLmdyb3Vwcy5yZXNvdXJjZSB8fCAhZm9ybWlvQ29tcG9uZW50cy5ncm91cHMucmVzb3VyY2UuZGlzYWJsZWQ7XG4gICAgICAgIGlmICgkc2NvcGUuZm9ybWlvICYmIHJlc291cmNlRW5hYmxlZCkge1xuICAgICAgICAgICRzY29wZS5mb3JtQ29tcG9uZW50c0J5R3JvdXAucmVzb3VyY2UgPSB7fTtcbiAgICAgICAgICAkc2NvcGUuZm9ybUNvbXBvbmVudEdyb3Vwcy5yZXNvdXJjZSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiAnRXhpc3RpbmcgUmVzb3VyY2UgRmllbGRzJyxcbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdzdWJncm91cC1hY2NvcmRpb24tY29udGFpbmVyJyxcbiAgICAgICAgICAgIHN1Ymdyb3Vwczoge31cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgJHNjb3BlLmZvcm1pby5sb2FkRm9ybXMoe3BhcmFtczoge3R5cGU6ICdyZXNvdXJjZScsIGxpbWl0OiAxMDB9fSkudGhlbihmdW5jdGlvbihyZXNvdXJjZXMpIHtcbiAgICAgICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgcmVzb3VyY2VzLlxuICAgICAgICAgICAgXy5lYWNoKHJlc291cmNlcywgZnVuY3Rpb24ocmVzb3VyY2UpIHtcbiAgICAgICAgICAgICAgdmFyIHJlc291cmNlS2V5ID0gcmVzb3VyY2UubmFtZTtcblxuICAgICAgICAgICAgICAvLyBBZGQgYSBsZWdlbmQgZm9yIHRoaXMgcmVzb3VyY2UuXG4gICAgICAgICAgICAgICRzY29wZS5mb3JtQ29tcG9uZW50c0J5R3JvdXAucmVzb3VyY2VbcmVzb3VyY2VLZXldID0gW107XG4gICAgICAgICAgICAgICRzY29wZS5mb3JtQ29tcG9uZW50R3JvdXBzLnJlc291cmNlLnN1Ymdyb3Vwc1tyZXNvdXJjZUtleV0gPSB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IHJlc291cmNlLnRpdGxlXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggY29tcG9uZW50LlxuICAgICAgICAgICAgICBGb3JtaW9VdGlscy5lYWNoQ29tcG9uZW50KHJlc291cmNlLmNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQudHlwZSA9PT0gJ2J1dHRvbicpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnROYW1lID0gY29tcG9uZW50LmxhYmVsO1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50TmFtZSAmJiBjb21wb25lbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICBjb21wb25lbnROYW1lID0gXy51cHBlckZpcnN0KGNvbXBvbmVudC5rZXkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRzY29wZS5mb3JtQ29tcG9uZW50c0J5R3JvdXAucmVzb3VyY2VbcmVzb3VyY2VLZXldLnB1c2goXy5tZXJnZShcbiAgICAgICAgICAgICAgICAgIF8uY2xvbmVEZWVwKGZvcm1pb0NvbXBvbmVudHMuY29tcG9uZW50c1tjb21wb25lbnQudHlwZV0sIHRydWUpLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogY29tcG9uZW50TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6ICdyZXNvdXJjZScsXG4gICAgICAgICAgICAgICAgICAgIHN1Ymdyb3VwOiByZXNvdXJjZUtleSxcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogY29tcG9uZW50LmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgIGtleTogY29tcG9uZW50LmtleSxcbiAgICAgICAgICAgICAgICAgICAgICBsb2NrS2V5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcmVzb3VyY2UuX2lkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2Zvcm1VcGRhdGUnLCAkc2NvcGUuZm9ybSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQWRkIGEgbmV3IGNvbXBvbmVudC5cbiAgICAgICAgJHNjb3BlLiRvbignZm9ybUJ1aWxkZXI6YWRkJywgdXBkYXRlKTtcbiAgICAgICAgJHNjb3BlLiRvbignZm9ybUJ1aWxkZXI6dXBkYXRlJywgdXBkYXRlKTtcbiAgICAgICAgJHNjb3BlLiRvbignZm9ybUJ1aWxkZXI6cmVtb3ZlJywgdXBkYXRlKTtcbiAgICAgICAgJHNjb3BlLiRvbignZm9ybUJ1aWxkZXI6ZWRpdCcsIHVwZGF0ZSk7XG5cbiAgICAgICAgJHNjb3BlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG5nRGlhbG9nLmNsb3NlQWxsKHRydWUpO1xuICAgICAgICAgICRzY29wZS4kZW1pdCgnZm9ybVVwZGF0ZScsICRzY29wZS5mb3JtKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FwaXRhbGl6ZSA9IF8uY2FwaXRhbGl6ZTtcblxuICAgICAgICAvLyBTZXQgdGhlIHJvb3QgbGlzdCBoZWlnaHQgdG8gdGhlIGhlaWdodCBvZiB0aGUgZm9ybWJ1aWxkZXIgZm9yIGVhc2Ugb2YgZm9ybSBidWlsZGluZy5cbiAgICAgICAgdmFyIHJvb3RsaXN0RUwgPSBhbmd1bGFyLmVsZW1lbnQoJy5yb290bGlzdCcpO1xuICAgICAgICB2YXIgZm9ybWJ1aWxkZXJFTCA9IGFuZ3VsYXIuZWxlbWVudCgnLmZvcm1idWlsZGVyJyk7XG5cbiAgICAgICAgJGludGVydmFsKGZ1bmN0aW9uIHNldFJvb3RMaXN0SGVpZ2h0KCkge1xuICAgICAgICAgIHZhciBsaXN0SGVpZ2h0ID0gcm9vdGxpc3RFTC5oZWlnaHQoJ2luaGVyaXQnKS5oZWlnaHQoKTtcbiAgICAgICAgICB2YXIgYnVpbGRlckhlaWdodCA9IGZvcm1idWlsZGVyRUwuaGVpZ2h0KCk7XG4gICAgICAgICAgaWYgKChidWlsZGVySGVpZ2h0IC0gbGlzdEhlaWdodCkgPiAxMDApIHtcbiAgICAgICAgICAgIHJvb3RsaXN0RUwuaGVpZ2h0KGJ1aWxkZXJIZWlnaHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgLy8gQWRkIHRvIHNjb3BlIHNvIGl0IGNhbiBiZSB1c2VkIGluIHRlbXBsYXRlc1xuICAgICAgICAkc2NvcGUuZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQgPSBkbmREcmFnSWZyYW1lV29ya2Fyb3VuZDtcbiAgICAgIH1cbiAgICBdLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICB2YXIgc2Nyb2xsU2lkZWJhciA9IGRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBEaXNhYmxlIGFsbCBidXR0b25zIHdpdGhpbiB0aGUgZm9ybS5cbiAgICAgICAgYW5ndWxhci5lbGVtZW50KCcuZm9ybWJ1aWxkZXInKS5maW5kKCdidXR0b24nKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXG4gICAgICAgIC8vIE1ha2UgdGhlIGxlZnQgY29sdW1uIGZvbGxvdyB0aGUgZm9ybS5cbiAgICAgICAgdmFyIGZvcm1Db21wb25lbnRzID0gYW5ndWxhci5lbGVtZW50KCcuZm9ybWNvbXBvbmVudHMnKTtcbiAgICAgICAgdmFyIGZvcm1CdWlsZGVyID0gYW5ndWxhci5lbGVtZW50KCcuZm9ybWJ1aWxkZXInKTtcbiAgICAgICAgaWYgKGZvcm1Db21wb25lbnRzLmxlbmd0aCAhPT0gMCAmJiBmb3JtQnVpbGRlci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICB2YXIgbWF4U2Nyb2xsID0gZm9ybUJ1aWxkZXIub3V0ZXJIZWlnaHQoKSA+IGZvcm1Db21wb25lbnRzLm91dGVySGVpZ2h0KCkgPyBmb3JtQnVpbGRlci5vdXRlckhlaWdodCgpIC0gZm9ybUNvbXBvbmVudHMub3V0ZXJIZWlnaHQoKSA6IDA7XG4gICAgICAgICAgLy8gNTAgcGl4ZWxzIGdpdmVzIHNwYWNlIGZvciB0aGUgZml4ZWQgaGVhZGVyLlxuICAgICAgICAgIHZhciBzY3JvbGwgPSBhbmd1bGFyLmVsZW1lbnQod2luZG93KS5zY3JvbGxUb3AoKSAtIGZvcm1Db21wb25lbnRzLnBhcmVudCgpLm9mZnNldCgpLnRvcCArIDUwO1xuICAgICAgICAgIGlmIChzY3JvbGwgPCAwKSB7XG4gICAgICAgICAgICBzY3JvbGwgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2Nyb2xsID4gbWF4U2Nyb2xsKSB7XG4gICAgICAgICAgICBzY3JvbGwgPSBtYXhTY3JvbGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvcm1Db21wb25lbnRzLmNzcygnbWFyZ2luLXRvcCcsIHNjcm9sbCArICdweCcpO1xuICAgICAgICB9XG4gICAgICB9LCAxMDAsIGZhbHNlKTtcbiAgICAgIHdpbmRvdy5vbnNjcm9sbCA9IHNjcm9sbFNpZGViYXI7XG4gICAgICBlbGVtZW50Lm9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cub25zY3JvbGwgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufV07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogQ3JlYXRlIHRoZSBmb3JtLWJ1aWxkZXItY29tcG9uZW50IGRpcmVjdGl2ZS5cbiAqIEV4dGVuZCB0aGUgZm9ybWlvLWNvbXBvbmVudCBkaXJlY3RpdmUgYW5kIGNoYW5nZSB0aGUgdGVtcGxhdGUuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gW1xuICAnZm9ybWlvQ29tcG9uZW50RGlyZWN0aXZlJyxcbiAgZnVuY3Rpb24oZm9ybWlvQ29tcG9uZW50RGlyZWN0aXZlKSB7XG4gICAgcmV0dXJuIGFuZ3VsYXIuZXh0ZW5kKHt9LCBmb3JtaW9Db21wb25lbnREaXJlY3RpdmVbMF0sIHtcbiAgICAgIHNjb3BlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAnZm9ybWlvL2Zvcm1idWlsZGVyL2NvbXBvbmVudC5odG1sJ1xuICAgIH0pO1xuICB9XG5dO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJ2Zvcm1pby11dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlOiAnJyArXG4gICAgICAgICc8dWliLWFjY29yZGlvbj4nICtcbiAgICAgICAgICAnPGRpdiB1aWItYWNjb3JkaW9uLWdyb3VwIGhlYWRpbmc9XCJTaW1wbGVcIiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIiBpcy1vcGVuPVwic3RhdHVzLnNpbXBsZVwiPicgK1xuICAgICAgICAgICAgJ1RoaXMgY29tcG9uZW50IHNob3VsZCBEaXNwbGF5OicgK1xuICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtbWRcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5jb25kaXRpb25hbC5zaG93XCI+JyArXG4gICAgICAgICAgICAnPG9wdGlvbiBuZy1yZXBlYXQ9XCJpdGVtIGluIF9ib29sZWFucyB0cmFjayBieSAkaW5kZXhcIiB2YWx1ZT1cInt7aXRlbX19XCI+e3tpdGVtLnRvU3RyaW5nKCl9fTwvb3B0aW9uPicgK1xuICAgICAgICAgICAgJzwvc2VsZWN0PicgK1xuICAgICAgICAgICAgJzxicj5XaGVuIHRoZSBmb3JtIGNvbXBvbmVudDonICtcbiAgICAgICAgICAgICc8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LW1kXCIgbmctbW9kZWw9XCJjb21wb25lbnQuY29uZGl0aW9uYWwud2hlblwiPicgK1xuICAgICAgICAgICAgJzxvcHRpb24gbmctcmVwZWF0PVwiaXRlbSBpbiBfY29tcG9uZW50cyB0cmFjayBieSAkaW5kZXhcIiB2YWx1ZT1cInt7aXRlbS5rZXl9fVwiPnt7aXRlbSAhPT0gXCJcIiA/IGl0ZW0ubGFiZWwgKyBcIiAoXCIgKyBpdGVtLmtleSArIFwiKVwiIDogXCJcIn19PC9vcHRpb24+JyArXG4gICAgICAgICAgICAnPC9zZWxlY3Q+JyArXG4gICAgICAgICAgICAnPGJyPkhhcyB0aGUgdmFsdWU6JyArXG4gICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtbWRcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5jb25kaXRpb25hbC5lcVwiPicgK1xuICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiB1aWItYWNjb3JkaW9uLWdyb3VwIGhlYWRpbmc9XCJXaGVuXCIgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCIgaXMtb3Blbj1cInN0YXR1cy5hZHZhbmNlZFwiPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJ3aGVuLWJsb2NrXCIgbmctcmVwZWF0PVwiY29uZGl0aW9uIGluIGNvbXBvbmVudC53aGVuQ29uZGl0aW9uc1wiPicgK1xuICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlblwiPldoZW4gZm9ybSB2YWx1ZSBpczogPGEgbmctY2xpY2s9XCJyZW1vdmVXaGVuQ29uZGl0aW9uKCRpbmRleClcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiPjxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUtY2lyY2xlXCI+PC9zcGFuPjwvYT48L2Rpdj4nICtcbiAgICAgICAgICAgICAgJzxmb3JtaW8tY29tcG9uZW50IGNvbXBvbmVudD1cImNvbXBvbmVudFwiIGRhdGE9XCJjb25kaXRpb24udmFsdWVcIiBmb3JtaW89XCI6OmZvcm1pb1wiPjwvZm9ybWlvLWNvbXBvbmVudD4nICtcbiAgICAgICAgICAgICAgJ1RoZW46JyArXG4gICAgICAgICAgICAgICc8c2VsZWN0IGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LW1kXCIgbmctbW9kZWw9XCJjb21wb25lbnQud2hlbkNvbmRpdGlvbnNbMF0udHlwZVwiIG5nLW9wdGlvbnM9XCJ0eXBlLmlkIGFzIHR5cGUubGFiZWwgZm9yIHR5cGUgaW4gY29uZGl0aW9uc1wiPjwvc2VsZWN0PicgK1xuICAgICAgICAgICAgICAnPG5nLWluY2x1ZGUgbmctaWY9XCJjb25kaXRpb24udHlwZVwiIHNyYz1cIlxcJ2Zvcm0tYWN0aW9uXFwnICsgY29uZGl0aW9uLnR5cGVcIj48L25nLWluY2x1ZGU+JyArXG4gICAgICAgICAgICAgICc8aHI+JytcbiAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8YSBuZy1jbGljaz1cImFkZFdoZW5Db25kaXRpb24oKVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IG5nLWJpbmRpbmdcIj48c3BhbiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcGx1c1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj4gQWRkIEFub3RoZXI8L2E+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IHVpYi1hY2NvcmRpb24tZ3JvdXAgaGVhZGluZz1cIlNjcmlwdGluZ1wiIGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiIGlzLW9wZW49XCJzdGF0dXMuYWR2YW5jZWRcIj4nICtcbiAgICAgICAgICAgICc8dGV4dGFyZWEgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiByb3dzPVwiNVwiIGlkPVwiY3VzdG9tXCIgbmFtZT1cImN1c3RvbVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LmN1c3RvbUNvbmRpdGlvbmFsXCIgcGxhY2Vob2xkZXI9XCIvKioqIEV4YW1wbGUgQ29kZSAqKiovXFxuc2hvdyA9IChkYXRhW1xcJ215a2V5XFwnXSA+IDEpO1wiPjwvdGV4dGFyZWE+JyArXG4gICAgICAgICAgICAnPHNtYWxsPicgK1xuICAgICAgICAgICAgJzxwPkVudGVyIGN1c3RvbSBjb25kaXRpb25hbCBjb2RlLjwvcD4nICtcbiAgICAgICAgICAgICc8cD5Zb3UgbXVzdCBhc3NpZ24gdGhlIDxzdHJvbmc+c2hvdzwvc3Ryb25nPiB2YXJpYWJsZSBhcyBlaXRoZXIgPHN0cm9uZz50cnVlPC9zdHJvbmc+IG9yIDxzdHJvbmc+ZmFsc2U8L3N0cm9uZz4uPC9wPicgK1xuICAgICAgICAgICAgJzxwPlRoZSBnbG9iYWwgdmFyaWFibGUgPHN0cm9uZz5kYXRhPC9zdHJvbmc+IGlzIHByb3ZpZGVkLCBhbmQgYWxsb3dzIHlvdSB0byBhY2Nlc3MgdGhlIGRhdGEgb2YgYW55IGZvcm0gY29tcG9uZW50LCBieSB1c2luZyBpdHMgQVBJIGtleS48L3A+JyArXG4gICAgICAgICAgICAnPHA+PHN0cm9uZz5Ob3RlOiBBZHZhbmNlZCBDb25kaXRpb25hbCBsb2dpYyB3aWxsIG92ZXJyaWRlIHRoZSByZXN1bHRzIG9mIHRoZSBTaW1wbGUgQ29uZGl0aW9uYWwgbG9naWMuPC9zdHJvbmc+PC9wPicgK1xuICAgICAgICAgICAgJzwvc21hbGw+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC91aWItYWNjb3JkaW9uPicsXG4gICAgICBjb250cm9sbGVyOiBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgICAgICAnZm9ybWlvQ29tcG9uZW50cycsXG4gICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJHRlbXBsYXRlQ2FjaGUsIGZvcm1pb0NvbXBvbmVudHMpIHtcbiAgICAgICAgICAvLyBEZWZhdWx0IHRoZSBjdXJyZW50IGNvbXBvbmVudHMgY29uZGl0aW9uYWwgbG9naWMuXG4gICAgICAgICAgJHNjb3BlLmNvbXBvbmVudCA9ICRzY29wZS5jb21wb25lbnQgfHwge307XG4gICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC5jb25kaXRpb25hbCA9ICRzY29wZS5jb21wb25lbnQuY29uZGl0aW9uYWwgfHwge307XG4gICAgICAgICAgdmFyIGNvbmRpdGlvbnMgPSBmb3JtaW9Db21wb25lbnRzLmNvbmRpdGlvbnM7XG4gICAgICAgICAgJHNjb3BlLmNvbmRpdGlvbnMgPSBbXTtcbiAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gY29uZGl0aW9ucykge1xuICAgICAgICAgICAgaWYgKGNvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICB2YXIgY29uZGl0aW9uID0gY29uZGl0aW9uc1trZXldO1xuICAgICAgICAgICAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm0tYWN0aW9uJyArIGtleSwgY29uZGl0aW9uLnRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgJHNjb3BlLmNvbmRpdGlvbnMucHVzaChjb25kaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgICRzY29wZS5jb21wb25lbnQud2hlbkNvbmRpdGlvbnMgPSAkc2NvcGUuY29tcG9uZW50LndoZW5Db25kaXRpb25zIHx8IFtdO1xuXG4gICAgICAgICAgLy8gVGhlIGF2YWlsYWJsZSBsb2dpYyBmdW5jdGlvbnMuXG4gICAgICAgICAgJHNjb3BlLl9ib29sZWFucyA9IFsnJywgJ3RydWUnLCAnZmFsc2UnXTtcblxuICAgICAgICAgIC8vIEZpbHRlciB0aGUgbGlzdCBvZiBhdmFpbGFibGUgZm9ybSBjb21wb25lbnRzIGZvciBjb25kaXRpb25hbCBsb2dpYy5cbiAgICAgICAgICAkc2NvcGUuX2NvbXBvbmVudHMgPSBfLmdldCgkc2NvcGUsICdmb3JtLmNvbXBvbmVudHMnKSB8fCBbXTtcbiAgICAgICAgICAkc2NvcGUuX2NvbXBvbmVudHMgPSB1dGlscy5mbGF0dGVuQ29tcG9uZW50cygkc2NvcGUuX2NvbXBvbmVudHMpO1xuICAgICAgICAgIC8vIFJlbW92ZSBub24taW5wdXQvYnV0dG9uIGZpZWxkcyBiZWNhdXNlIHRoZXkgZG9uJ3QgbWFrZSBzZW5zZS5cbiAgICAgICAgICAvLyBGQS04OTAgLSBEb250IGFsbG93IHRoZSBjdXJyZW50IGNvbXBvbmVudCB0byBiZSBhIGNvbmRpdGlvbmFsIHRyaWdnZXIuXG4gICAgICAgICAgJHNjb3BlLl9jb21wb25lbnRzID0gXy5yZWplY3QoJHNjb3BlLl9jb21wb25lbnRzLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICByZXR1cm4gIWMuaW5wdXQgfHwgKGMudHlwZSA9PT0gJ2J1dHRvbicpIHx8IChjLmtleSA9PT0gJHNjb3BlLmNvbXBvbmVudC5rZXkpIHx8ICghYy5sYWJlbCAmJiAhYy5rZXkpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gQWRkIGRlZmF1bHQgaXRlbSB0byB0aGUgY29tcG9uZW50cyBsaXN0LlxuICAgICAgICAgICRzY29wZS5fY29tcG9uZW50cy51bnNoaWZ0KCcnKTtcblxuICAgICAgICAgIC8vIERlZmF1bHQgYW5kIHdhdGNoIHRoZSBzaG93IGxvZ2ljLlxuICAgICAgICAgICRzY29wZS5jb21wb25lbnQuY29uZGl0aW9uYWwuc2hvdyA9ICRzY29wZS5jb21wb25lbnQuY29uZGl0aW9uYWwuc2hvdyB8fCAnJztcbiAgICAgICAgICAvLyBDb2VyY2Ugc2hvdyB2YXIgdG8gc3VwcG9ydGVkIHZhbHVlLlxuICAgICAgICAgIHZhciBfYm9vbGVhbk1hcCA9IHtcbiAgICAgICAgICAgICcnOiAnJyxcbiAgICAgICAgICAgICd0cnVlJzogJ3RydWUnLFxuICAgICAgICAgICAgJ2ZhbHNlJzogJ2ZhbHNlJ1xuICAgICAgICAgIH07XG4gICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC5jb25kaXRpb25hbC5zaG93ID0gX2Jvb2xlYW5NYXAuaGFzT3duUHJvcGVydHkoJHNjb3BlLmNvbXBvbmVudC5jb25kaXRpb25hbC5zaG93KVxuICAgICAgICAgICAgPyBfYm9vbGVhbk1hcFskc2NvcGUuY29tcG9uZW50LmNvbmRpdGlvbmFsLnNob3ddXG4gICAgICAgICAgICA6ICcnO1xuXG4gICAgICAgICAgLy8gRGVmYXVsdCBhbmQgd2F0Y2ggdGhlIHdoZW4gbG9naWMuXG4gICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC5jb25kaXRpb25hbC53aGVuID0gJHNjb3BlLmNvbXBvbmVudC5jb25kaXRpb25hbC53aGVuIHx8IG51bGw7XG5cbiAgICAgICAgICAvLyBEZWZhdWx0IGFuZCB3YXRjaCB0aGUgc2VhcmNoIGxvZ2ljLlxuICAgICAgICAgICRzY29wZS5jb21wb25lbnQuY29uZGl0aW9uYWwuZXEgPSAkc2NvcGUuY29tcG9uZW50LmNvbmRpdGlvbmFsLmVxIHx8ICcnO1xuXG4gICAgICAgICAgLy8gVHJhY2sgdGhlIHN0YXR1cyBvZiB0aGUgYWNjb3JkaW9uIHBhbmVscyBvcGVuIHN0YXRlLlxuICAgICAgICAgICRzY29wZS5zdGF0dXMgPSB7XG4gICAgICAgICAgICBzaW1wbGU6ICEkc2NvcGUuY29tcG9uZW50LmN1c3RvbUNvbmRpdGlvbmFsLFxuICAgICAgICAgICAgYWR2YW5jZWQ6ICEhJHNjb3BlLmNvbXBvbmVudC5jdXN0b21Db25kaXRpb25hbFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICAkc2NvcGUuYWRkV2hlbkNvbmRpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC53aGVuQ29uZGl0aW9ucy5wdXNoKHt9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgJHNjb3BlLnJlbW92ZVdoZW5Db25kaXRpb24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC53aGVuQ29uZGl0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9O1xuICB9XG5dO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJyRzY29wZScsXG4gICckcm9vdFNjb3BlJyxcbiAgJ2Zvcm1pb0NvbXBvbmVudHMnLFxuICAnbmdEaWFsb2cnLFxuICAnZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQnLFxuICBmdW5jdGlvbihcbiAgICAkc2NvcGUsXG4gICAgJHJvb3RTY29wZSxcbiAgICBmb3JtaW9Db21wb25lbnRzLFxuICAgIG5nRGlhbG9nLFxuICAgIGRuZERyYWdJZnJhbWVXb3JrYXJvdW5kXG4gICkge1xuICAgICRzY29wZS5idWlsZGVyID0gdHJ1ZTtcbiAgICAkcm9vdFNjb3BlLmJ1aWxkZXIgPSB0cnVlO1xuICAgICRzY29wZS5oaWRlQ291bnQgPSAoXy5pc051bWJlcigkc2NvcGUuaGlkZURuZEJveENvdW50KSA/ICRzY29wZS5oaWRlRG5kQm94Q291bnQgOiAxKTtcbiAgICAkc2NvcGUuJHdhdGNoKCdoaWRlRG5kQm94Q291bnQnLCBmdW5jdGlvbihoaWRlQ291bnQpIHtcbiAgICAgICRzY29wZS5oaWRlQ291bnQgPSBoaWRlQ291bnQgPyBoaWRlQ291bnQgOiAxO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLmZvcm1Db21wb25lbnRzID0gZm9ybWlvQ29tcG9uZW50cy5jb21wb25lbnRzO1xuXG4gICAgLy8gQ29tcG9uZW50cyBkZXBlbmQgb24gdGhpcyBleGlzdGluZ1xuICAgICRzY29wZS5kYXRhID0ge307XG5cbiAgICAkc2NvcGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBhcmdzWzBdID0gJ2Zvcm1CdWlsZGVyOicgKyBhcmdzWzBdO1xuICAgICAgJHNjb3BlLiRlbWl0LmFwcGx5KCRzY29wZSwgYXJncyk7XG4gICAgfTtcblxuICAgICRzY29wZS5hZGRDb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnQsIGluZGV4KSB7XG4gICAgICAvLyBPbmx5IGVkaXQgaW1tZWRpYXRlbHkgZm9yIGNvbXBvbmVudHMgdGhhdCBhcmUgbm90IHJlc291cmNlIGNvbXBzLlxuICAgICAgaWYgKGNvbXBvbmVudC5pc05ldyAmJiAoIWNvbXBvbmVudC5rZXkgfHwgKGNvbXBvbmVudC5rZXkuaW5kZXhPZignLicpID09PSAtMSkpKSB7XG4gICAgICAgICRzY29wZS5lZGl0Q29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29tcG9uZW50LmlzTmV3ID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlZnJlc2ggYWxsIENLRWRpdG9yIGluc3RhbmNlc1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2NrZWRpdG9yLnJlZnJlc2gnKTtcblxuICAgICAgZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgJHNjb3BlLmVtaXQoJ2FkZCcpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcm9vdCBjb21wb25lbnQgYW5kIHRoZSBkaXNwbGF5IGlzIGEgd2l6YXJkLCB0aGVuIHdlIGtub3dcbiAgICAgIC8vIHRoYXQgdGhleSBkcm9wcGVkIHRoZSBjb21wb25lbnQgb3V0c2lkZSBvZiB3aGVyZSBpdCBpcyBzdXBwb3NlZCB0byBnby4uLlxuICAgICAgLy8gSW5zdGVhZCBhcHBlbmQgb3IgcHJlcGVuZCB0byB0aGUgY29tcG9uZW50cyBhcnJheS5cbiAgICAgIGlmICgkc2NvcGUuY29tcG9uZW50LmRpc3BsYXkgPT09ICd3aXphcmQnKSB7XG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHBhZ2VJbmRleCA9IChpbmRleCA9PT0gMCkgPyAwIDogJHNjb3BlLmZvcm0uY29tcG9uZW50c1skc2NvcGUuZm9ybS5wYWdlXS5jb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgICAkc2NvcGUuZm9ybS5jb21wb25lbnRzWyRzY29wZS5mb3JtLnBhZ2VdLmNvbXBvbmVudHMuc3BsaWNlKHBhZ2VJbmRleCwgMCwgY29tcG9uZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGV5IGRvbid0IGV2ZXIgYWRkIGEgY29tcG9uZW50IG9uIHRoZSBib3R0b20gb2YgdGhlIHN1Ym1pdCBidXR0b24uXG4gICAgICB2YXIgbGFzdENvbXBvbmVudCA9ICRzY29wZS5jb21wb25lbnQuY29tcG9uZW50c1skc2NvcGUuY29tcG9uZW50LmNvbXBvbmVudHMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoXG4gICAgICAgIChsYXN0Q29tcG9uZW50KSAmJlxuICAgICAgICAobGFzdENvbXBvbmVudC50eXBlID09PSAnYnV0dG9uJykgJiZcbiAgICAgICAgKGxhc3RDb21wb25lbnQuYWN0aW9uID09PSAnc3VibWl0JylcbiAgICAgICkge1xuICAgICAgICAvLyBUaGVyZSBpcyBvbmx5IG9uZSBlbGVtZW50IG9uIHRoZSBwYWdlLlxuICAgICAgICBpZiAoJHNjb3BlLmNvbXBvbmVudC5jb21wb25lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbmRleCA+PSAkc2NvcGUuY29tcG9uZW50LmNvbXBvbmVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgaW5kZXggLT0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgdGhlIGNvbXBvbmVudCB0byB0aGUgY29tcG9uZW50cyBhcnJheS5cbiAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5jb21wb25lbnQuY29tcG9uZW50cy5zcGxpY2UoaW5kZXgsIDAsIGNvbXBvbmVudCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gUmV0dXJuIHRydWUgc2luY2UgdGhpcyB3aWxsIHRlbGwgdGhlIGRyYWctYW5kLWRyb3AgbGlzdCBjb21wb25lbnQgdG8gbm90IGluc2VydCBpbnRvIGl0cyBvd24gYXJyYXkuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLy8gQWxsb3cgcHJvdG90eXBlZCBzY29wZXMgdG8gdXBkYXRlIHRoZSBvcmlnaW5hbCBjb21wb25lbnQuXG4gICAgJHNjb3BlLnVwZGF0ZUNvbXBvbmVudCA9IGZ1bmN0aW9uKG5ld0NvbXBvbmVudCwgb2xkQ29tcG9uZW50KSB7XG4gICAgICB2YXIgbGlzdCA9ICRzY29wZS5jb21wb25lbnQuY29tcG9uZW50cztcbiAgICAgIGxpc3Quc3BsaWNlKGxpc3QuaW5kZXhPZihvbGRDb21wb25lbnQpLCAxLCBuZXdDb21wb25lbnQpO1xuICAgICAgJHNjb3BlLiRlbWl0KCd1cGRhdGUnLCBuZXdDb21wb25lbnQpO1xuICAgIH07XG5cbiAgICB2YXIgcmVtb3ZlID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICBpZiAoJHNjb3BlLmNvbXBvbmVudC5jb21wb25lbnRzLmluZGV4T2YoY29tcG9uZW50KSAhPT0gLTEpIHtcbiAgICAgICAgJHNjb3BlLmNvbXBvbmVudC5jb21wb25lbnRzLnNwbGljZSgkc2NvcGUuY29tcG9uZW50LmNvbXBvbmVudHMuaW5kZXhPZihjb21wb25lbnQpLCAxKTtcbiAgICAgICAgJHNjb3BlLmVtaXQoJ3JlbW92ZScsIGNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5yZW1vdmVDb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnQsIHNob3VsZENvbmZpcm0pIHtcbiAgICAgIGlmIChzaG91bGRDb25maXJtKSB7XG4gICAgICAgIC8vIFNob3cgY29uZmlybSBkaWFsb2cgYmVmb3JlIHJlbW92aW5nIGEgY29tcG9uZW50XG4gICAgICAgIG5nRGlhbG9nLm9wZW4oe1xuICAgICAgICAgIHRlbXBsYXRlOiAnZm9ybWlvL2NvbXBvbmVudHMvY29uZmlybS1yZW1vdmUuaHRtbCcsXG4gICAgICAgICAgc2hvd0Nsb3NlOiBmYWxzZVxuICAgICAgICB9KS5jbG9zZVByb21pc2UudGhlbihmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIGNhbmNlbGxlZCA9IGUudmFsdWUgPT09IGZhbHNlIHx8IGUudmFsdWUgPT09ICckY2xvc2VCdXR0b24nIHx8IGUudmFsdWUgPT09ICckZG9jdW1lbnQnO1xuICAgICAgICAgIGlmICghY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICByZW1vdmUoY29tcG9uZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlbW92ZShjb21wb25lbnQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBSZXR1cm4gdGhlIGZvcm0gcGFnZXMuXG4gICAgJHNjb3BlLmdldFBhZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFnZXMgPSBbXTtcbiAgICAgICRzY29wZS5mb3JtLmNvbXBvbmVudHMuZm9yRWFjaChmdW5jdGlvbihjb21wb25lbnQsIGluZGV4KSB7XG4gICAgICAgIGNvbXBvbmVudCA9IGFuZ3VsYXIuY29weShjb21wb25lbnQpO1xuICAgICAgICBpZiAoY29tcG9uZW50LnR5cGUgPT09ICdwYW5lbCcpIHtcbiAgICAgICAgICBpZiAoIWNvbXBvbmVudC50aXRsZSkge1xuICAgICAgICAgICAgY29tcG9uZW50LnRpdGxlID0gJ1BhZ2UgJyArIChpbmRleCArIDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhZ2VzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcGFnZXM7XG4gICAgfTtcblxuICAgIC8vIEVkaXQgYSBzcGVjaWZpYyBjb21wb25lbnQuXG4gICAgJHNjb3BlLmVkaXRDb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICRzY29wZS5mb3JtQ29tcG9uZW50ID0gZm9ybWlvQ29tcG9uZW50cy5jb21wb25lbnRzW2NvbXBvbmVudC50eXBlXSB8fCBmb3JtaW9Db21wb25lbnRzLmNvbXBvbmVudHMuY3VzdG9tO1xuICAgICAgLy8gTm8gZWRpdCB2aWV3IGF2YWlsYWJsZVxuICAgICAgaWYgKCEkc2NvcGUuZm9ybUNvbXBvbmVudC5oYXNPd25Qcm9wZXJ0eSgndmlld3MnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBjaGlsZCBpc29sYXRlIHNjb3BlIGZvciBkaWFsb2dcbiAgICAgIHZhciBjaGlsZFNjb3BlID0gJHNjb3BlLiRuZXcoZmFsc2UpO1xuICAgICAgY2hpbGRTY29wZS5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgICBjaGlsZFNjb3BlLmZvcm0gPSAkc2NvcGUuZm9ybTtcbiAgICAgIGNoaWxkU2NvcGUucGFnZXMgPSAkc2NvcGUuZ2V0UGFnZXMoKTtcbiAgICAgIGNoaWxkU2NvcGUuZGF0YSA9IHt9O1xuICAgICAgaWYgKGNvbXBvbmVudC5rZXkpIHtcbiAgICAgICAgY2hpbGRTY29wZS5kYXRhW2NvbXBvbmVudC5rZXldID0gY29tcG9uZW50Lm11bHRpcGxlID8gWycnXSA6ICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJldmlvdXNTZXR0aW5ncyA9IGFuZ3VsYXIuY29weShjb21wb25lbnQpO1xuXG4gICAgICAvLyBPcGVuIHRoZSBkaWFsb2cuXG4gICAgICBuZ0RpYWxvZy5vcGVuKHtcbiAgICAgICAgdGVtcGxhdGU6ICdmb3JtaW8vY29tcG9uZW50cy9zZXR0aW5ncy5odG1sJyxcbiAgICAgICAgc2NvcGU6IGNoaWxkU2NvcGUsXG4gICAgICAgIGNsYXNzTmFtZTogJ25nZGlhbG9nLXRoZW1lLWRlZmF1bHQgY29tcG9uZW50LXNldHRpbmdzJyxcbiAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnRm9ybWlvJywgJyRjb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBGb3JtaW8sICRjb250cm9sbGVyKSB7XG4gICAgICAgICAgLy8gQWxsb3cgdGhlIGNvbXBvbmVudCB0byBhZGQgY3VzdG9tIGxvZ2ljIHRvIHRoZSBlZGl0IHBhZ2UuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgJHNjb3BlLmZvcm1Db21wb25lbnQgJiYgJHNjb3BlLmZvcm1Db21wb25lbnQub25FZGl0XG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICAkY29udHJvbGxlcigkc2NvcGUuZm9ybUNvbXBvbmVudC5vbkVkaXQsIHskc2NvcGU6ICRzY29wZX0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRzY29wZS4kd2F0Y2goJ2NvbXBvbmVudC5tdWx0aXBsZScsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YVskc2NvcGUuY29tcG9uZW50LmtleV0gPSB2YWx1ZSA/IFsnJ10gOiAnJztcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFdhdGNoIHRoZSBzZXR0aW5ncyBsYWJlbCBhbmQgYXV0byBzZXQgdGhlIGtleSBmcm9tIGl0LlxuICAgICAgICAgIHZhciBpbnZhbGlkUmVnZXggPSAvXlteQS1aYS16XSp8W15BLVphLXowLTlcXC1dKi9nO1xuICAgICAgICAgICRzY29wZS4kd2F0Y2goJ2NvbXBvbmVudC5sYWJlbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jb21wb25lbnQubGFiZWwgJiYgISRzY29wZS5jb21wb25lbnQubG9ja0tleSAmJiAkc2NvcGUuY29tcG9uZW50LmlzTmV3KSB7XG4gICAgICAgICAgICAgIGlmICgkc2NvcGUuZGF0YS5oYXNPd25Qcm9wZXJ0eSgkc2NvcGUuY29tcG9uZW50LmtleSkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgJHNjb3BlLmRhdGFbJHNjb3BlLmNvbXBvbmVudC5rZXldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICRzY29wZS5jb21wb25lbnQua2V5ID0gXy5jYW1lbENhc2UoJHNjb3BlLmNvbXBvbmVudC5sYWJlbC5yZXBsYWNlKGludmFsaWRSZWdleCwgJycpKTtcbiAgICAgICAgICAgICAgJHNjb3BlLmRhdGFbJHNjb3BlLmNvbXBvbmVudC5rZXldID0gJHNjb3BlLmNvbXBvbmVudC5tdWx0aXBsZSA/IFsnJ10gOiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfV1cbiAgICAgIH0pLmNsb3NlUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGNhbmNlbGxlZCA9IGUudmFsdWUgPT09IGZhbHNlIHx8IGUudmFsdWUgPT09ICckY2xvc2VCdXR0b24nIHx8IGUudmFsdWUgPT09ICckZG9jdW1lbnQnO1xuICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgaWYgKGNvbXBvbmVudC5pc05ldykge1xuICAgICAgICAgICAgcmVtb3ZlKGNvbXBvbmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gUmV2ZXJ0IHRvIG9sZCBzZXR0aW5ncywgYnV0IHVzZSB0aGUgc2FtZSBvYmplY3QgcmVmZXJlbmNlXG4gICAgICAgICAgICBfLmFzc2lnbihjb21wb25lbnQsIHByZXZpb3VzU2V0dGluZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgY29tcG9uZW50LmlzTmV3O1xuICAgICAgICAgICRzY29wZS5lbWl0KCdlZGl0JywgY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEFkZCB0byBzY29wZSBzbyBpdCBjYW4gYmUgdXNlZCBpbiB0ZW1wbGF0ZXNcbiAgICAkc2NvcGUuZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQgPSBkbmREcmFnSWZyYW1lV29ya2Fyb3VuZDtcbiAgfVxuXTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBbXG4gICdmb3JtaW9FbGVtZW50RGlyZWN0aXZlJyxcbiAgZnVuY3Rpb24oZm9ybWlvRWxlbWVudERpcmVjdGl2ZSkge1xuICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7fSwgZm9ybWlvRWxlbWVudERpcmVjdGl2ZVswXSwge1xuICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgY29udHJvbGxlcjogW1xuICAgICAgICAnJHNjb3BlJyxcbiAgICAgICAgJ2Zvcm1pb0NvbXBvbmVudHMnLFxuICAgICAgICBmdW5jdGlvbihcbiAgICAgICAgICAkc2NvcGUsXG4gICAgICAgICAgZm9ybWlvQ29tcG9uZW50c1xuICAgICAgICApIHtcbiAgICAgICAgICAkc2NvcGUuYnVpbGRlciA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLmZvcm1Db21wb25lbnQgPSBmb3JtaW9Db21wb25lbnRzLmNvbXBvbmVudHNbJHNjb3BlLmNvbXBvbmVudC50eXBlXSB8fCBmb3JtaW9Db21wb25lbnRzLmNvbXBvbmVudHMuY3VzdG9tO1xuICAgICAgICAgIGlmICgkc2NvcGUuZm9ybUNvbXBvbmVudC5mYnRlbXBsYXRlKSB7XG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSAkc2NvcGUuZm9ybUNvbXBvbmVudC5mYnRlbXBsYXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG5dO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGNvbXBvbmVudDogJz0nLFxuICAgICAgICBmb3JtaW86ICc9JyxcbiAgICAgICAgZm9ybTogJz0nLFxuICAgICAgICAvLyAjIG9mIGl0ZW1zIG5lZWRlZCBpbiB0aGUgbGlzdCBiZWZvcmUgaGlkaW5nIHRoZVxuICAgICAgICAvLyBkcmFnIGFuZCBkcm9wIHByb21wdCBkaXZcbiAgICAgICAgaGlkZURuZEJveENvdW50OiAnPScsXG4gICAgICAgIHJvb3RMaXN0OiAnPSdcbiAgICAgIH0sXG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgIGNvbnRyb2xsZXI6ICdmb3JtQnVpbGRlckRuZCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2Zvcm1pby9mb3JtYnVpbGRlci9saXN0Lmh0bWwnXG4gICAgfTtcbiAgfVxuXTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4qIFRoaXMgZGlyZWN0aXZlIGNyZWF0ZXMgYSBmaWVsZCBmb3IgdHdlYWtpbmcgY29tcG9uZW50IG9wdGlvbnMuXG4qIFRoaXMgbmVlZHMgYXQgbGVhc3QgYSBwcm9wZXJ0eSBhdHRyaWJ1dGUgc3BlY2lmeWluZyB3aGF0IHByb3BlcnR5XG4qIG9mIHRoZSBjb21wb25lbnQgdG8gYmluZCB0by5cbipcbiogSWYgdGhlIHByb3BlcnR5IGlzIGRlZmluZWQgaW4gQ09NTU9OX09QVElPTlMgYWJvdmUsIGl0IHdpbGwgYXV0b21hdGljYWxseVxuKiBwb3B1bGF0ZSBpdHMgbGFiZWwsIHBsYWNlaG9sZGVyLCBpbnB1dCB0eXBlLCBhbmQgdG9vbHRpcC4gSWYgbm90LCB5b3UgbWF5IHNwZWNpZnlcbiogdGhvc2UgdmlhIGF0dHJpYnV0ZXMgKGV4Y2VwdCBmb3IgdG9vbHRpcCwgd2hpY2ggeW91IGNhbiBzcGVjaWZ5IHdpdGggdGhlIHRpdGxlIGF0dHJpYnV0ZSkuXG4qIFRoZSBnZW5lcmF0ZWQgaW5wdXQgd2lsbCBhbHNvIGNhcnJ5IG92ZXIgYW55IG90aGVyIHByb3BlcnRpZXMgeW91IHNwZWNpZnkgb24gdGhpcyBkaXJlY3RpdmUuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBbJ0NPTU1PTl9PUFRJT05TJywgZnVuY3Rpb24oQ09NTU9OX09QVElPTlMpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcXVpcmU6ICdwcm9wZXJ0eScsXG4gICAgcHJpb3JpdHk6IDIsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24oZWwsIGF0dHJzKSB7XG4gICAgICB2YXIgcHJvcGVydHkgPSBhdHRycy5wcm9wZXJ0eTtcbiAgICAgIHZhciBsYWJlbCA9IGF0dHJzLmxhYmVsIHx8IChDT01NT05fT1BUSU9OU1twcm9wZXJ0eV0gJiYgQ09NTU9OX09QVElPTlNbcHJvcGVydHldLmxhYmVsKSB8fCAnJztcbiAgICAgIHZhciBwbGFjZWhvbGRlciA9IChDT01NT05fT1BUSU9OU1twcm9wZXJ0eV0gJiYgQ09NTU9OX09QVElPTlNbcHJvcGVydHldLnBsYWNlaG9sZGVyKSB8fCBudWxsO1xuICAgICAgdmFyIHR5cGUgPSAoQ09NTU9OX09QVElPTlNbcHJvcGVydHldICYmIENPTU1PTl9PUFRJT05TW3Byb3BlcnR5XS50eXBlKSB8fCAndGV4dCc7XG4gICAgICB2YXIgdG9vbHRpcCA9IChDT01NT05fT1BUSU9OU1twcm9wZXJ0eV0gJiYgQ09NTU9OX09QVElPTlNbcHJvcGVydHldLnRvb2x0aXApIHx8ICcnO1xuXG4gICAgICB2YXIgaW5wdXQgPSBhbmd1bGFyLmVsZW1lbnQoJzxpbnB1dD4nKTtcbiAgICAgIHZhciBpbnB1dEF0dHJzID0ge1xuICAgICAgICBpZDogcHJvcGVydHksXG4gICAgICAgIG5hbWU6IHByb3BlcnR5LFxuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAnbmctbW9kZWwnOiAnY29tcG9uZW50LicgKyBwcm9wZXJ0eSxcbiAgICAgICAgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyXG4gICAgICB9O1xuICAgICAgLy8gUGFzcyB0aHJvdWdoIGF0dHJpYnV0ZXMgZnJvbSB0aGUgZGlyZWN0aXZlIHRvIHRoZSBpbnB1dCBlbGVtZW50XG4gICAgICBhbmd1bGFyLmZvckVhY2goYXR0cnMuJGF0dHIsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpbnB1dEF0dHJzW2tleV0gPSBhdHRyc1trZXldO1xuICAgICAgICAvLyBBbGxvdyBzcGVjaWZ5aW5nIHRvb2x0aXAgdmlhIHRpdGxlIGF0dHJcbiAgICAgICAgaWYgKGtleS50b0xvd2VyQ2FzZSgpID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgdG9vbHRpcCA9IGF0dHJzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgbWluL21heCB2YWx1ZSBmbG9vciB2YWx1ZXMgZm9yIHZhbGlkYXRpb24uXG4gICAgICBpZiAocHJvcGVydHkgPT09ICd2YWxpZGF0ZS5taW5MZW5ndGgnIHx8IHByb3BlcnR5ID09PSAndmFsaWRhdGUubWF4TGVuZ3RoJykge1xuICAgICAgICBpbnB1dEF0dHJzLm1pbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlucHV0LmF0dHIoaW5wdXRBdHRycyk7XG5cbiAgICAgIC8vIENoZWNrYm94ZXMgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudCBsYXlvdXRcbiAgICAgIGlmIChpbnB1dEF0dHJzLnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2NoZWNrYm94Jykge1xuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJjaGVja2JveFwiPicgK1xuICAgICAgICAgICAgICAgICc8bGFiZWwgZm9yPVwiJyArIHByb3BlcnR5ICsgJ1wiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiJyArIHRvb2x0aXAgKyAnXCI+JyArXG4gICAgICAgICAgICAgICAgaW5wdXQucHJvcCgnb3V0ZXJIVE1MJykgK1xuICAgICAgICAgICAgICAgICcgJyArIGxhYmVsICsgJzwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICc8L2Rpdj4nO1xuICAgICAgfVxuXG4gICAgICBpbnB1dC5hZGRDbGFzcygnZm9ybS1jb250cm9sJyk7XG4gICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+JyArXG4gICAgICAgICAgICAgICAgJzxsYWJlbCBmb3I9XCInICsgcHJvcGVydHkgKyAnXCIgZm9ybS1idWlsZGVyLXRvb2x0aXA9XCInICsgdG9vbHRpcCArICdcIj4nICsgbGFiZWwgKyAnPC9sYWJlbD4nICtcbiAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKCdvdXRlckhUTUwnKSArXG4gICAgICAgICAgICAgICc8L2Rpdj4nO1xuICAgIH1cbiAgfTtcbn1dO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiogQSBkaXJlY3RpdmUgZm9yIGVkaXRpbmcgYSBjb21wb25lbnQncyBjdXN0b20gdmFsaWRhdGlvbi5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJycgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCIgaWQ9XCJhY2NvcmRpb25cIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCIgZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiIGRhdGEtcGFyZW50PVwiI2FjY29yZGlvblwiIGRhdGEtdGFyZ2V0PVwiI3ZhbGlkYXRpb25TZWN0aW9uXCI+JyArXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwicGFuZWwtdGl0bGVcIj5DdXN0b20gVmFsaWRhdGlvbjwvc3Bhbj4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPGRpdiBpZD1cInZhbGlkYXRpb25TZWN0aW9uXCIgY2xhc3M9XCJwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZSBpblwiPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPicgK1xuICAgICAgICAgICAgJzx0ZXh0YXJlYSBjbGFzcz1cImZvcm0tY29udHJvbFwiIHJvd3M9XCI1XCIgaWQ9XCJjdXN0b21cIiBuYW1lPVwiY3VzdG9tXCIgbmctbW9kZWw9XCJjb21wb25lbnQudmFsaWRhdGUuY3VzdG9tXCIgcGxhY2Vob2xkZXI9XCIvKioqIEV4YW1wbGUgQ29kZSAqKiovXFxudmFsaWQgPSAoaW5wdXQgPT09IDMpID8gdHJ1ZSA6IFxcJ011c3QgYmUgM1xcJztcIj57eyBjb21wb25lbnQudmFsaWRhdGUuY3VzdG9tIH19PC90ZXh0YXJlYT4nICtcbiAgICAgICAgICAgICc8c21hbGw+JyArXG4gICAgICAgICAgICAgICc8cD5FbnRlciBjdXN0b20gdmFsaWRhdGlvbiBjb2RlLjwvcD4nICtcbiAgICAgICAgICAgICAgJzxwPllvdSBtdXN0IGFzc2lnbiB0aGUgPHN0cm9uZz52YWxpZDwvc3Ryb25nPiB2YXJpYWJsZSBhcyBlaXRoZXIgPHN0cm9uZz50cnVlPC9zdHJvbmc+IG9yIGFuIGVycm9yIG1lc3NhZ2UgaWYgdmFsaWRhdGlvbiBmYWlscy48L3A+JyArXG4gICAgICAgICAgICAgICc8cD5UaGUgZ2xvYmFsIHZhcmlhYmxlcyA8c3Ryb25nPmlucHV0PC9zdHJvbmc+LCA8c3Ryb25nPmNvbXBvbmVudDwvc3Ryb25nPiwgYW5kIDxzdHJvbmc+dmFsaWQ8L3N0cm9uZz4gYXJlIHByb3ZpZGVkLjwvcD4nICtcbiAgICAgICAgICAgICc8L3NtYWxsPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJ3ZWxsXCI+JyArXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY2hlY2tib3hcIj4nICtcbiAgICAgICAgICAgICAgICAnPGxhYmVsPicgK1xuICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInByaXZhdGVcIiBuYW1lPVwicHJpdmF0ZVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LnZhbGlkYXRlLmN1c3RvbVByaXZhdGVcIiBuZy1jaGVja2VkPVwiY29tcG9uZW50LnZhbGlkYXRlLmN1c3RvbVByaXZhdGVcIj4gPHN0cm9uZz5TZWNyZXQgVmFsaWRhdGlvbjwvc3Ryb25nPicgK1xuICAgICAgICAgICAgICAgICc8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICc8cD5DaGVjayB0aGlzIGlmIHlvdSB3aXNoIHRvIHBlcmZvcm0gdGhlIHZhbGlkYXRpb24gT05MWSBvbiB0aGUgc2VydmVyIHNpZGUuIFRoaXMga2VlcHMgeW91ciB2YWxpZGF0aW9uIGxvZ2ljIHByaXZhdGUgYW5kIHNlY3JldC48L3A+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAnPC9kaXY+J1xuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4qIEEgZGlyZWN0aXZlIGZvciBhIGZpZWxkIHRvIGVkaXQgYSBjb21wb25lbnQncyBrZXkuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgdGVtcGxhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiIG5nLWNsYXNzPVwie1xcJ2hhcy13YXJuaW5nXFwnOiBzaG91bGRXYXJuQWJvdXRFbWJlZGRpbmcoKX1cIj4nICtcbiAgICAgICAgICAgICAgICAnPGxhYmVsIGZvcj1cImtleVwiIGNsYXNzPVwiY29udHJvbC1sYWJlbFwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGhlIG5hbWUgb2YgdGhpcyBmaWVsZCBpbiB0aGUgQVBJIGVuZHBvaW50LlwiPlByb3BlcnR5IE5hbWU8L2xhYmVsPicgK1xuICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwia2V5XCIgbmFtZT1cImtleVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LmtleVwiIHZhbGlkLWFwaS1rZXkgdmFsdWU9XCJ7eyBjb21wb25lbnQua2V5IH19XCIgJyArXG4gICAgICAgICAgICAgICAgJ25nLWRpc2FibGVkPVwiY29tcG9uZW50LnNvdXJjZVwiIG5nLWJsdXI9XCJvbkJsdXIoKVwiPicgK1xuICAgICAgICAgICAgICAgICc8cCBuZy1pZj1cInNob3VsZFdhcm5BYm91dEVtYmVkZGluZygpXCIgY2xhc3M9XCJoZWxwLWJsb2NrXCI+PHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWV4Y2xhbWF0aW9uLXNpZ25cIj48L3NwYW4+ICcgK1xuICAgICAgICAgICAgICAgICAgJ1VzaW5nIGEgZG90IGluIHlvdXIgUHJvcGVydHkgTmFtZSB3aWxsIGxpbmsgdGhpcyBmaWVsZCB0byBhIGZpZWxkIGZyb20gYSBSZXNvdXJjZS4gRG9pbmcgdGhpcyBtYW51YWxseSBpcyBub3QgcmVjb21tZW5kZWQgYmVjYXVzZSB5b3Ugd2lsbCBleHBlcmllbmNlIHVuZXhwZWN0ZWQgYmVoYXZpb3IgaWYgdGhlIFJlc291cmNlIGZpZWxkIGlzIG5vdCBmb3VuZC4gSWYgeW91IHdpc2ggdG8gZW1iZWQgYSBSZXNvdXJjZSBmaWVsZCBpbiB5b3VyIGZvcm0sIHVzZSBhIGNvbXBvbmVudCBmcm9tIHRoZSBjb3JyZXNwb25kaW5nIFJlc291cmNlIENvbXBvbmVudHMgY2F0ZWdvcnkgb24gdGhlIGxlZnQuJyArXG4gICAgICAgICAgICAgICAgJzwvcD4nICtcbiAgICAgICAgICAgICAgJzwvZGl2Pic7XG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICdGb3JtaW9VdGlscycsIGZ1bmN0aW9uKCRzY29wZSwgRm9ybWlvVXRpbHMpIHtcbiAgICAgIHZhciBzdWZmaXhSZWdleCA9IC8oXFxkKykkLztcblxuICAgICAgLy8gUHJlYnVpbGQgYSBsaXN0IG9mIGV4aXN0aW5nIGNvbXBvbmVudHMuXG4gICAgICB2YXIgZXhpc3RpbmdDb21wb25lbnRzID0ge307XG4gICAgICBGb3JtaW9VdGlscy5lYWNoQ29tcG9uZW50KCRzY29wZS5mb3JtLmNvbXBvbmVudHMsIGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICAvLyBEb24ndCBhZGQgdG8gZXhpc3RpbmcgY29tcG9uZW50cyBpZiBjdXJyZW50IGNvbXBvbmVudCBvciBpZiBpdCBpcyBuZXcuIChOZXcgY291bGQgbWVhbiBzYW1lIGFzIGFub3RoZXIgaXRlbSkuXG4gICAgICAgIGlmIChjb21wb25lbnQua2V5ICYmICgkc2NvcGUuY29tcG9uZW50LmtleSAhPT0gY29tcG9uZW50LmtleSB8fCAkc2NvcGUuY29tcG9uZW50LmlzTmV3KSkge1xuICAgICAgICAgIGV4aXN0aW5nQ29tcG9uZW50c1tjb21wb25lbnQua2V5XSA9IGNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgIHZhciBrZXlFeGlzdHMgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKGV4aXN0aW5nQ29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eShjb21wb25lbnQua2V5KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBpdGVyYXRlS2V5ID0gZnVuY3Rpb24oY29tcG9uZW50S2V5KSB7XG4gICAgICAgIGlmICghY29tcG9uZW50S2V5Lm1hdGNoKHN1ZmZpeFJlZ2V4KSkge1xuICAgICAgICAgIHJldHVybiBjb21wb25lbnRLZXkgKyAnMSc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29tcG9uZW50S2V5LnJlcGxhY2Uoc3VmZml4UmVnZXgsIGZ1bmN0aW9uKHN1ZmZpeCkge1xuICAgICAgICAgIHJldHVybiBOdW1iZXIoc3VmZml4KSArIDE7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgLy8gQXBwZW5kcyBhIG51bWJlciB0byBhIGNvbXBvbmVudC5rZXkgdG8ga2VlcCBpdCB1bmlxdWVcbiAgICAgIHZhciB1bmlxdWlmeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISRzY29wZS5jb21wb25lbnQua2V5KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChrZXlFeGlzdHMoJHNjb3BlLmNvbXBvbmVudCkpIHtcbiAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LmtleSA9IGl0ZXJhdGVLZXkoJHNjb3BlLmNvbXBvbmVudC5rZXkpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJHdhdGNoKCdjb21wb25lbnQua2V5JywgdW5pcXVpZnkpO1xuXG4gICAgICAkc2NvcGUub25CbHVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5jb21wb25lbnQubG9ja0tleSA9IHRydWU7XG5cbiAgICAgICAgLy8gSWYgdGhleSB0cnkgdG8gaW5wdXQgYW4gZW1wdHkga2V5LCByZWZpbGwgaXQgd2l0aCBkZWZhdWx0IGFuZCBsZXQgdW5pcXVpZnlcbiAgICAgICAgLy8gbWFrZSBpdCB1bmlxdWVcbiAgICAgICAgaWYgKCEkc2NvcGUuY29tcG9uZW50LmtleSAmJiAkc2NvcGUuZm9ybUNvbXBvbmVudHNbJHNjb3BlLmNvbXBvbmVudC50eXBlXS5zZXR0aW5ncy5rZXkpIHtcbiAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LmtleSA9ICRzY29wZS5mb3JtQ29tcG9uZW50c1skc2NvcGUuY29tcG9uZW50LnR5cGVdLnNldHRpbmdzLmtleTtcbiAgICAgICAgICAkc2NvcGUuY29tcG9uZW50LmxvY2tLZXkgPSBmYWxzZTsgLy8gQWxzbyB1bmxvY2sga2V5XG4gICAgICAgICAgdW5pcXVpZnkoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3VsZFdhcm5BYm91dEVtYmVkZGluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISRzY29wZS5jb21wb25lbnQgfHwgISRzY29wZS5jb21wb25lbnQua2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhJHNjb3BlLmNvbXBvbmVudC5zb3VyY2UgJiYgJHNjb3BlLmNvbXBvbmVudC5rZXkuaW5kZXhPZignLicpICE9PSAtMTtcbiAgICAgIH07XG4gICAgfV1cbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuKiBBIGRpcmVjdGl2ZSBmb3IgYSBmaWVsZCB0byBlZGl0IGEgY29tcG9uZW50J3MgdGFncy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJycgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgJyAgPGxhYmVsIGNsYXNzPVwiY29udHJvbC1sYWJlbFwiIGZvcm0tYnVpbGRlci10b29sdGlwPVwiVGFnIHRoZSBmaWVsZCBmb3IgdXNlIGluIGN1c3RvbSBsb2dpYy5cIj5GaWVsZCBUYWdzPC9sYWJlbD4nICtcbiAgICAgICAgJyAgPHRhZ3MtaW5wdXQgbmctbW9kZWw9XCJ0YWdzXCIgb24tdGFnLWFkZGVkPVwiYWRkVGFnKCR0YWcpXCIgb24tdGFnLXJlbW92ZWQ9XCJyZW1vdmVUYWcoJHRhZylcIj48L3RhZ3MtaW5wdXQ+JyArXG4gICAgICAgICc8L2Rpdj4nO1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICRzY29wZS5jb21wb25lbnQudGFncyA9ICRzY29wZS5jb21wb25lbnQudGFncyB8fCBbXTtcbiAgICAgICRzY29wZS50YWdzID0gXy5tYXAoJHNjb3BlLmNvbXBvbmVudC50YWdzLCBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgcmV0dXJuIHt0ZXh0OiB0YWd9O1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5hZGRUYWcgPSBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUuY29tcG9uZW50KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghJHNjb3BlLmNvbXBvbmVudC50YWdzKSB7XG4gICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC50YWdzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLmNvbXBvbmVudC50YWdzLnB1c2godGFnLnRleHQpO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5yZW1vdmVUYWcgPSBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgaWYgKCRzY29wZS5jb21wb25lbnQudGFncyAmJiAkc2NvcGUuY29tcG9uZW50LnRhZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHRhZ0luZGV4ID0gJHNjb3BlLmNvbXBvbmVudC50YWdzLmluZGV4T2YodGFnLnRleHQpO1xuICAgICAgICAgIGlmICh0YWdJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICRzY29wZS5jb21wb25lbnQudGFncy5zcGxpY2UodGFnSW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XVxuICB9O1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBbXG4gIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzY29wZToge1xuICAgICAgICBjb21wb25lbnQ6ICc9JyxcbiAgICAgICAgZm9ybWlvOiAnPScsXG4gICAgICAgIGZvcm06ICc9JyxcbiAgICAgICAgLy8gIyBvZiBpdGVtcyBuZWVkZWQgaW4gdGhlIGxpc3QgYmVmb3JlIGhpZGluZyB0aGVcbiAgICAgICAgLy8gZHJhZyBhbmQgZHJvcCBwcm9tcHQgZGl2XG4gICAgICAgIGhpZGVEbmRCb3hDb3VudDogJz0nXG4gICAgICB9LFxuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICBjb250cm9sbGVyOiAnZm9ybUJ1aWxkZXJEbmQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdmb3JtaW8vZm9ybWJ1aWxkZXIvcm93Lmh0bWwnXG4gICAgfTtcbiAgfVxuXTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBBIGRpcmVjdGl2ZSBmb3IgYSB0YWJsZSBidWlsZGVyXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHRlbXBsYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImZvcm0tYnVpbGRlci10YWJsZVwiPicgK1xuICAgICAgICAnICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPicgK1xuICAgICAgICAnICAgIDxsYWJlbCBmb3I9XCJsYWJlbFwiPk51bWJlciBvZiBSb3dzPC9sYWJlbD4nICtcbiAgICAgICAgJyAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJudW1Sb3dzXCIgbmFtZT1cIm51bVJvd3NcIiBwbGFjZWhvbGRlcj1cIk51bWJlciBvZiBSb3dzXCIgbmctbW9kZWw9XCJjb21wb25lbnQubnVtUm93c1wiPicgK1xuICAgICAgICAnICA8L2Rpdj4nICtcbiAgICAgICAgJyAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgJyAgICA8bGFiZWwgZm9yPVwibGFiZWxcIj5OdW1iZXIgb2YgQ29sdW1uczwvbGFiZWw+JyArXG4gICAgICAgICcgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwibnVtQ29sc1wiIG5hbWU9XCJudW1Db2xzXCIgcGxhY2Vob2xkZXI9XCJOdW1iZXIgb2YgQ29sdW1uc1wiIG5nLW1vZGVsPVwiY29tcG9uZW50Lm51bUNvbHNcIj4nICtcbiAgICAgICAgJyAgPC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nO1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogW1xuICAgICAgJyRzY29wZScsXG4gICAgICBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgJHNjb3BlLmJ1aWxkZXIgPSB0cnVlO1xuICAgICAgICB2YXIgY2hhbmdlVGFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvKmVzbGludC1kaXNhYmxlIG1heC1kZXB0aCAqL1xuICAgICAgICAgIGlmICgkc2NvcGUuY29tcG9uZW50Lm51bVJvd3MgJiYgJHNjb3BlLmNvbXBvbmVudC5udW1Db2xzKSB7XG4gICAgICAgICAgICB2YXIgdG1wVGFibGUgPSBbXTtcbiAgICAgICAgICAgICRzY29wZS5jb21wb25lbnQucm93cy5zcGxpY2UoJHNjb3BlLmNvbXBvbmVudC5udW1Sb3dzKTtcbiAgICAgICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8ICRzY29wZS5jb21wb25lbnQubnVtUm93czsgcm93KyspIHtcbiAgICAgICAgICAgICAgaWYgKCRzY29wZS5jb21wb25lbnQucm93c1tyb3ddKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbXBvbmVudC5yb3dzW3Jvd10uc3BsaWNlKCRzY29wZS5jb21wb25lbnQubnVtQ29scyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgJHNjb3BlLmNvbXBvbmVudC5udW1Db2xzOyBjb2wrKykge1xuICAgICAgICAgICAgICAgIGlmICghdG1wVGFibGVbcm93XSkge1xuICAgICAgICAgICAgICAgICAgdG1wVGFibGVbcm93XSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0bXBUYWJsZVtyb3ddW2NvbF0gPSB7Y29tcG9uZW50czpbXX07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5jb21wb25lbnQucm93cyA9IF8ubWVyZ2UodG1wVGFibGUsICRzY29wZS5jb21wb25lbnQucm93cyk7XG4gICAgICAgICAgICAvKmVzbGludC1lbmFibGUgbWF4LWRlcHRoICovXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kd2F0Y2goJ2NvbXBvbmVudC5udW1Sb3dzJywgY2hhbmdlVGFibGUpO1xuICAgICAgICAkc2NvcGUuJHdhdGNoKCdjb21wb25lbnQubnVtQ29scycsIGNoYW5nZVRhYmxlKTtcbiAgICAgIH1cbiAgICBdXG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiogSW52b2tlcyBCb290c3RyYXAncyBwb3BvdmVyIGpxdWVyeSBwbHVnaW4gb24gYW4gZWxlbWVudFxuKiBUb29sdGlwIHRleHQgY2FuIGJlIHByb3ZpZGVkIHZpYSB0aXRsZSBhdHRyaWJ1dGUgb3JcbiogYXMgdGhlIHZhbHVlIGZvciB0aGlzIGRpcmVjdGl2ZS5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgcmVwbGFjZTogZmFsc2UsXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCBlbCwgYXR0cnMpIHtcbiAgICAgIGlmIChhdHRycy5mb3JtQnVpbGRlclRvb2x0aXAgfHwgYXR0cnMudGl0bGUpIHtcbiAgICAgICAgdmFyIHRvb2x0aXAgPSBhbmd1bGFyLmVsZW1lbnQoJzxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1xdWVzdGlvbi1zaWduIHRleHQtbXV0ZWRcIj48L2k+Jyk7XG4gICAgICAgIHRvb2x0aXAucG9wb3Zlcih7XG4gICAgICAgICAgaHRtbDogdHJ1ZSxcbiAgICAgICAgICB0cmlnZ2VyOiAnbWFudWFsJyxcbiAgICAgICAgICBwbGFjZW1lbnQ6ICdyaWdodCcsXG4gICAgICAgICAgY29udGVudDogYXR0cnMudGl0bGUgfHwgYXR0cnMuZm9ybUJ1aWxkZXJUb29sdGlwXG4gICAgICAgIH0pLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRzZWxmID0gYW5ndWxhci5lbGVtZW50KHRoaXMpO1xuICAgICAgICAgICRzZWxmLnBvcG92ZXIoJ3Nob3cnKTtcbiAgICAgICAgICAkc2VsZi5zaWJsaW5ncygnLnBvcG92ZXInKS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNlbGYucG9wb3ZlcignaGlkZScpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkc2VsZiA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFhbmd1bGFyLmVsZW1lbnQoJy5wb3BvdmVyOmhvdmVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICRzZWxmLnBvcG92ZXIoJ2hpZGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9KTtcbiAgICAgICAgZWwuYXBwZW5kKCcgJykuYXBwZW5kKHRvb2x0aXApO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIsIGN0cmwpIHtcbiAgICAgIGN0cmwuJHBhcnNlcnMucHVzaChmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBvYmogPSBKU09OLnBhcnNlKGlucHV0KTtcbiAgICAgICAgICBjdHJsLiRzZXRWYWxpZGl0eSgnanNvbklucHV0JywgdHJ1ZSk7XG4gICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdqc29uSW5wdXQnLCBmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdqc29uSW5wdXQnLCBmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIHN0ciA9IGFuZ3VsYXIudG9Kc29uKGRhdGEsIHRydWUpO1xuICAgICAgICAgIGN0cmwuJHNldFZhbGlkaXR5KCdqc29uSW5wdXQnLCB0cnVlKTtcbiAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgY3RybC4kc2V0VmFsaWRpdHkoJ2pzb25JbnB1dCcsIGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4qIFByZXZlbnRzIHVzZXIgaW5wdXR0aW5nIGludmFsaWQgYXBpIGtleSBjaGFyYWN0ZXJzLlxuKiBWYWxpZCBjaGFyYWN0ZXJzIGZvciBhbiBhcGkga2V5IGFyZSBhbHBoYW51bWVyaWMgYW5kIGh5cGhlbnNcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcbiAgICAgIHZhciBpbnZhbGlkUmVnZXggPSAvXlteQS1aYS16XSt8W15BLVphLXowLTlcXC1cXC5dKy9nO1xuICAgICAgbmdNb2RlbC4kcGFyc2Vycy5wdXNoKGZ1bmN0aW9uKGlucHV0VmFsdWUpIHtcbiAgICAgICAgdmFyIHRyYW5zZm9ybWVkSW5wdXQgPSBpbnB1dFZhbHVlLnJlcGxhY2UoaW52YWxpZFJlZ2V4LCAnJyk7XG4gICAgICAgIGlmICh0cmFuc2Zvcm1lZElucHV0ICE9PSBpbnB1dFZhbHVlKSB7XG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHRyYW5zZm9ybWVkSW5wdXQpO1xuICAgICAgICAgIG5nTW9kZWwuJHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZElucHV0O1xuICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiogQSBkaXJlY3RpdmUgdGhhdCBwcm92aWRlcyBhIFVJIHRvIGFkZCB7dmFsdWUsIGxhYmVsfSBvYmplY3RzIHRvIGFuIGFycmF5LlxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgc2NvcGU6IHtcbiAgICAgIGRhdGE6ICc9JyxcbiAgICAgIGxhYmVsOiAnQCcsXG4gICAgICB0b29sdGlwVGV4dDogJ0AnLFxuICAgICAgdmFsdWVMYWJlbDogJ0AnLFxuICAgICAgbGFiZWxMYWJlbDogJ0AnLFxuICAgICAgdmFsdWVQcm9wZXJ0eTogJ0AnLFxuICAgICAgbGFiZWxQcm9wZXJ0eTogJ0AnXG4gICAgfSxcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj4nICtcbiAgICAgICAgICAgICAgICAnPGxhYmVsIGZvcm0tYnVpbGRlci10b29sdGlwPVwie3sgdG9vbHRpcFRleHQgfX1cIj57eyBsYWJlbCB9fTwvbGFiZWw+JyArXG4gICAgICAgICAgICAgICAgJzx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWNvbmRlbnNlZFwiPicgK1xuICAgICAgICAgICAgICAgICAgJzx0aGVhZD4nICtcbiAgICAgICAgICAgICAgICAgICAgJzx0cj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPHRoIGNsYXNzPVwiY29sLXhzLTZcIj57eyBsYWJlbExhYmVsIH19PC90aD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPHRoIGNsYXNzPVwiY29sLXhzLTRcIj57eyB2YWx1ZUxhYmVsIH19PC90aD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPHRoIGNsYXNzPVwiY29sLXhzLTJcIj48L3RoPicgK1xuICAgICAgICAgICAgICAgICAgICAnPC90cj4nICtcbiAgICAgICAgICAgICAgICAgICc8L3RoZWFkPicgK1xuICAgICAgICAgICAgICAgICAgJzx0Ym9keT4nICtcbiAgICAgICAgICAgICAgICAgICAgJzx0ciBuZy1yZXBlYXQ9XCJ2IGluIGRhdGEgdHJhY2sgYnkgJGluZGV4XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzx0ZCBjbGFzcz1cImNvbC14cy02XCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBuZy1tb2RlbD1cInZbbGFiZWxQcm9wZXJ0eV1cIiBwbGFjZWhvbGRlcj1cInt7IGxhYmVsTGFiZWwgfX1cIi8+PC90ZD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAnPHRkIGNsYXNzPVwiY29sLXhzLTRcIj48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIG5nLW1vZGVsPVwidlt2YWx1ZVByb3BlcnR5XVwiIHBsYWNlaG9sZGVyPVwie3sgdmFsdWVMYWJlbCB9fVwiLz48L3RkPicgK1xuICAgICAgICAgICAgICAgICAgICAgICc8dGQgY2xhc3M9XCJjb2wteHMtMlwiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLXhzXCIgbmctY2xpY2s9XCJyZW1vdmVWYWx1ZSgkaW5kZXgpXCIgdGFiaW5kZXg9XCItMVwiPjxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUtY2lyY2xlXCI+PC9zcGFuPjwvYnV0dG9uPjwvdGQ+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L3RyPicgK1xuICAgICAgICAgICAgICAgICAgJzwvdGJvZHk+JyArXG4gICAgICAgICAgICAgICAgJzwvdGFibGU+JyArXG4gICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuXCIgbmctY2xpY2s9XCJhZGRWYWx1ZSgpXCI+QWRkIHt7IHZhbHVlTGFiZWwgfX08L2J1dHRvbj4nICtcbiAgICAgICAgICAgICAgJzwvZGl2PicsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsIGVsLCBhdHRycykge1xuICAgICAgJHNjb3BlLnZhbHVlUHJvcGVydHkgPSAkc2NvcGUudmFsdWVQcm9wZXJ0eSB8fCAndmFsdWUnO1xuICAgICAgJHNjb3BlLmxhYmVsUHJvcGVydHkgPSAkc2NvcGUubGFiZWxQcm9wZXJ0eSB8fCAnbGFiZWwnO1xuICAgICAgJHNjb3BlLnZhbHVlTGFiZWwgPSAkc2NvcGUudmFsdWVMYWJlbCB8fCAnVmFsdWUnO1xuICAgICAgJHNjb3BlLmxhYmVsTGFiZWwgPSAkc2NvcGUubGFiZWxMYWJlbCB8fCAnTGFiZWwnO1xuXG4gICAgICAkc2NvcGUuYWRkVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBvYmpbJHNjb3BlLnZhbHVlUHJvcGVydHldID0gJyc7XG4gICAgICAgIG9ialskc2NvcGUubGFiZWxQcm9wZXJ0eV0gPSAnJztcbiAgICAgICAgJHNjb3BlLmRhdGEucHVzaChvYmopO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJlbW92ZVZhbHVlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLmRhdGEuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH07XG5cbiAgICAgIGlmICgkc2NvcGUuZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgJHNjb3BlLmFkZFZhbHVlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghYXR0cnMubm9BdXRvY29tcGxldGVWYWx1ZSkge1xuICAgICAgICAkc2NvcGUuJHdhdGNoKCdkYXRhJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgLy8gSWdub3JlIGFycmF5IGFkZGl0aW9uL2RlbGV0aW9uIGNoYW5nZXNcbiAgICAgICAgICBpZiAobmV3VmFsdWUubGVuZ3RoICE9PSBvbGRWYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBfLm1hcChuZXdWYWx1ZSwgZnVuY3Rpb24oZW50cnksIGkpIHtcbiAgICAgICAgICAgIGlmIChlbnRyeVskc2NvcGUubGFiZWxQcm9wZXJ0eV0gIT09IG9sZFZhbHVlW2ldWyRzY29wZS5sYWJlbFByb3BlcnR5XSkgey8vIGxhYmVsIGNoYW5nZWRcbiAgICAgICAgICAgICAgaWYgKGVudHJ5WyRzY29wZS52YWx1ZVByb3BlcnR5XSA9PT0gJycgfHwgZW50cnlbJHNjb3BlLnZhbHVlUHJvcGVydHldID09PSBfLmNhbWVsQ2FzZShvbGRWYWx1ZVtpXVskc2NvcGUubGFiZWxQcm9wZXJ0eV0pKSB7XG4gICAgICAgICAgICAgICAgZW50cnlbJHNjb3BlLnZhbHVlUHJvcGVydHldID0gXy5jYW1lbENhc2UoZW50cnlbJHNjb3BlLmxhYmVsUHJvcGVydHldKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBDcmVhdGUgYW4gQW5ndWxhckpTIHNlcnZpY2UgY2FsbGVkIGRlYm91bmNlXG5tb2R1bGUuZXhwb3J0cyA9IFsnJHRpbWVvdXQnLCckcScsIGZ1bmN0aW9uKCR0aW1lb3V0LCAkcSkge1xuICAvLyBUaGUgc2VydmljZSBpcyBhY3R1YWxseSB0aGlzIGZ1bmN0aW9uLCB3aGljaCB3ZSBjYWxsIHdpdGggdGhlIGZ1bmNcbiAgLy8gdGhhdCBzaG91bGQgYmUgZGVib3VuY2VkIGFuZCBob3cgbG9uZyB0byB3YWl0IGluIGJldHdlZW4gY2FsbHNcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0O1xuICAgIC8vIENyZWF0ZSBhIGRlZmVycmVkIG9iamVjdCB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2hlbiB3ZSBuZWVkIHRvXG4gICAgLy8gYWN0dWFsbHkgY2FsbCB0aGUgZnVuY1xuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKSk7XG4gICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIHRpbWVvdXQgKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lb3V0KTtcbiAgICAgIH1cbiAgICAgIHRpbWVvdXQgPSAkdGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZ1bmMuYXBwbHkoY29udGV4dCxhcmdzKSk7XG4gICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG4gIH07XG59XTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyohIG5nLWZvcm1pby1idWlsZGVyIHY8JT12ZXJzaW9uJT4gfCBodHRwczovL3VucGtnLmNvbS9uZy1mb3JtaW8tYnVpbGRlckA8JT12ZXJzaW9uJT4vTElDRU5TRS50eHQgKi9cbi8qZ2xvYmFsIHdpbmRvdzogZmFsc2UsIGNvbnNvbGU6IGZhbHNlICovXG4vKmpzaGludCBicm93c2VyOiB0cnVlICovXG5cblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCduZ0Zvcm1CdWlsZGVyJywgW1xuICAnZm9ybWlvJyxcbiAgJ2RuZExpc3RzJyxcbiAgJ25nRGlhbG9nJyxcbiAgJ3VpLmJvb3RzdHJhcC5hY2NvcmRpb24nLFxuICAnbmdDa2VkaXRvcidcbl0pO1xuXG5hcHAuY29uc3RhbnQoJ0ZPUk1fT1BUSU9OUycsIHJlcXVpcmUoJy4vY29uc3RhbnRzL2Zvcm1PcHRpb25zJykpO1xuXG5hcHAuY29uc3RhbnQoJ0NPTU1PTl9PUFRJT05TJywgcmVxdWlyZSgnLi9jb25zdGFudHMvY29tbW9uT3B0aW9ucycpKTtcblxuYXBwLmZhY3RvcnkoJ2RlYm91bmNlJywgcmVxdWlyZSgnLi9mYWN0b3JpZXMvZGVib3VuY2UnKSk7XG5cbmFwcC5kaXJlY3RpdmUoJ2Zvcm1CdWlsZGVyJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyJykpO1xuXG5hcHAuZGlyZWN0aXZlKCdmb3JtQnVpbGRlckNvbXBvbmVudCcsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9mb3JtQnVpbGRlckNvbXBvbmVudCcpKTtcblxuYXBwLmRpcmVjdGl2ZSgnZm9ybUJ1aWxkZXJFbGVtZW50JywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyRWxlbWVudCcpKTtcblxuYXBwLmNvbnRyb2xsZXIoJ2Zvcm1CdWlsZGVyRG5kJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyRG5kJykpO1xuXG5hcHAuZGlyZWN0aXZlKCdmb3JtQnVpbGRlckxpc3QnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJMaXN0JykpO1xuXG5hcHAuZGlyZWN0aXZlKCdmb3JtQnVpbGRlclJvdycsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9mb3JtQnVpbGRlclJvdycpKTtcblxuYXBwLmRpcmVjdGl2ZSgnanNvbklucHV0JywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL2pzb25JbnB1dCcpKTtcblxuYXBwLmRpcmVjdGl2ZSgnZm9ybUJ1aWxkZXJPcHRpb24nLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJPcHRpb24nKSk7XG5cbmFwcC5kaXJlY3RpdmUoJ2Zvcm1CdWlsZGVyVGFibGUnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJUYWJsZScpKTtcblxuYXBwLmRpcmVjdGl2ZSgnZm9ybUJ1aWxkZXJPcHRpb25LZXknLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJPcHRpb25LZXknKSk7XG5cbmFwcC5kaXJlY3RpdmUoJ2Zvcm1CdWlsZGVyT3B0aW9uVGFncycsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9mb3JtQnVpbGRlck9wdGlvblRhZ3MnKSk7XG5cbmFwcC5kaXJlY3RpdmUoJ3ZhbGlkQXBpS2V5JywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL3ZhbGlkQXBpS2V5JykpO1xuXG5hcHAuZGlyZWN0aXZlKCdmb3JtQnVpbGRlck9wdGlvbkN1c3RvbVZhbGlkYXRpb24nLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJPcHRpb25DdXN0b21WYWxpZGF0aW9uJykpO1xuXG5hcHAuZGlyZWN0aXZlKCdmb3JtQnVpbGRlclRvb2x0aXAnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvZm9ybUJ1aWxkZXJUb29sdGlwJykpO1xuXG5hcHAuZGlyZWN0aXZlKCd2YWx1ZUJ1aWxkZXInLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvdmFsdWVCdWlsZGVyJykpO1xuXG5hcHAuZGlyZWN0aXZlKCdmb3JtQnVpbGRlckNvbmRpdGlvbmFsJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL2Zvcm1CdWlsZGVyQ29uZGl0aW9uYWwnKSk7XG5cbi8qKlxuICogVGhpcyB3b3JrYXJvdW5kIGhhbmRsZXMgdGhlIGZhY3QgdGhhdCBpZnJhbWVzIGNhcHR1cmUgbW91c2UgZHJhZ1xuICogZXZlbnRzLiBUaGlzIGludGVyZmVyZXMgd2l0aCBkcmFnZ2luZyBvdmVyIGNvbXBvbmVudHMgbGlrZSB0aGVcbiAqIENvbnRlbnQgY29tcG9uZW50LiBBcyBhIHdvcmthcm91bmQsIHdlIGtlZXAgdHJhY2sgb2YgdGhlIGlzRHJhZ2dpbmdcbiAqIGZsYWcgaGVyZSB0byBvdmVybGF5IGlmcmFtZXMgd2l0aCBhIGRpdiB3aGlsZSBkcmFnZ2luZy5cbiAqL1xuYXBwLnZhbHVlKCdkbmREcmFnSWZyYW1lV29ya2Fyb3VuZCcsIHtcbiAgaXNEcmFnZ2luZzogZmFsc2Vcbn0pO1xuXG5hcHAucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgJyRyb290U2NvcGUnLFxuICAnbmdEaWFsb2cnLFxuICBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSwgJHJvb3RTY29wZSwgbmdEaWFsb2cpIHtcbiAgICAvLyBDbG9zZSBhbGwgb3BlbiBkaWFsb2dzIG9uIHN0YXRlIGNoYW5nZS5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIG5nRGlhbG9nLmNsb3NlQWxsKGZhbHNlKTtcbiAgICB9KTtcblxuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2Zvcm1idWlsZGVyL2VkaXRidXR0b25zLmh0bWwnLFxuICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJjb21wb25lbnQtYnRuLWdyb3VwXFxcIj5cXG4gIDxkaXYgY2xhc3M9XFxcImJ0biBidG4teHhzIGJ0bi1kYW5nZXIgY29tcG9uZW50LXNldHRpbmdzLWJ1dHRvblxcXCIgc3R5bGU9XFxcInotaW5kZXg6IDEwMDBcXFwiIG5nLWNsaWNrPVxcXCJyZW1vdmVDb21wb25lbnQoY29tcG9uZW50LCBmb3JtQ29tcG9uZW50LmNvbmZpcm1SZW1vdmUpXFxcIj48c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcXFwiPjwvc3Bhbj48L2Rpdj5cXG4gIDxkaXYgbmctaWY9XFxcIjo6IWhpZGVNb3ZlQnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi14eHMgYnRuLWRlZmF1bHQgY29tcG9uZW50LXNldHRpbmdzLWJ1dHRvblxcXCIgc3R5bGU9XFxcInotaW5kZXg6IDEwMDBcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uIGdseXBoaWNvbi1tb3ZlXFxcIj48L3NwYW4+PC9kaXY+XFxuICA8ZGl2IG5nLWlmPVxcXCI6OmZvcm1Db21wb25lbnQudmlld3NcXFwiIGNsYXNzPVxcXCJidG4gYnRuLXh4cyBidG4tZGVmYXVsdCBjb21wb25lbnQtc2V0dGluZ3MtYnV0dG9uXFxcIiBzdHlsZT1cXFwiei1pbmRleDogMTAwMFxcXCIgbmctY2xpY2s9XFxcImVkaXRDb21wb25lbnQoY29tcG9uZW50KVxcXCI+PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY29nXFxcIj48L3NwYW4+PC9kaXY+XFxuPC9kaXY+XFxuXCJcbiAgICApO1xuXG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vZm9ybWJ1aWxkZXIvY29tcG9uZW50Lmh0bWwnLFxuICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJjb21wb25lbnQtZm9ybS1ncm91cCBjb21wb25lbnQtdHlwZS17eyBjb21wb25lbnQudHlwZSB9fSBmb3JtLWJ1aWxkZXItY29tcG9uZW50XFxcIj5cXG4gIDxkaXYgbmctaWY9XFxcIjo6IWhpZGVCdXR0b25zXFxcIiBuZy1pbmNsdWRlPVxcXCInZm9ybWlvL2Zvcm1idWlsZGVyL2VkaXRidXR0b25zLmh0bWwnXFxcIj48L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXAgaGFzLWZlZWRiYWNrIGZvcm0tZmllbGQtdHlwZS17eyBjb21wb25lbnQudHlwZSB9fSB7e2NvbXBvbmVudC5jdXN0b21DbGFzc319XFxcIiBpZD1cXFwiZm9ybS1ncm91cC17eyBjb21wb25lbnQua2V5IH19XFxcIiBzdHlsZT1cXFwicG9zaXRpb246aW5oZXJpdFxcXCIgbmctc3R5bGU9XFxcImNvbXBvbmVudC5zdHlsZVxcXCI+XFxuICAgIDxmb3JtLWJ1aWxkZXItZWxlbWVudD48L2Zvcm0tYnVpbGRlci1lbGVtZW50PlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXCJcbiAgICApO1xuXG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdmb3JtaW8vZm9ybWJ1aWxkZXIvbGlzdC5odG1sJyxcbiAgICAgIFwiPHVsIGNsYXNzPVxcXCJjb21wb25lbnQtbGlzdFxcXCJcXG4gICAgZG5kLWxpc3Q9XFxcImNvbXBvbmVudC5jb21wb25lbnRzXFxcIlxcbiAgICBkbmQtZHJvcD1cXFwiYWRkQ29tcG9uZW50KGl0ZW0sIGluZGV4KVxcXCI+XFxuICA8bGkgbmctaWY9XFxcImNvbXBvbmVudC5jb21wb25lbnRzLmxlbmd0aCA8IGhpZGVDb3VudFxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LWluZm9cXFwiIHN0eWxlPVxcXCJ0ZXh0LWFsaWduOmNlbnRlcjsgbWFyZ2luLWJvdHRvbTogNXB4O1xcXCIgcm9sZT1cXFwiYWxlcnRcXFwiPlxcbiAgICAgIERyYWcgYW5kIERyb3AgYSBmb3JtIGNvbXBvbmVudFxcbiAgICA8L2Rpdj5cXG4gIDwvbGk+XFxuICA8IS0tIERPIE5PVCBQVVQgXFxcInRyYWNrIGJ5ICRpbmRleFxcXCIgSEVSRSBTSU5DRSBEWU5BTUlDQUxMWSBBRERJTkcvUkVNT1ZJTkcgQ09NUE9ORU5UUyBXSUxMIEJSRUFLIC0tPlxcbiAgPGxpIG5nLXJlcGVhdD1cXFwiY29tcG9uZW50IGluIGNvbXBvbmVudC5jb21wb25lbnRzXFxcIlxcbiAgICAgIG5nLWlmPVxcXCIhcm9vdExpc3QgfHwgIWZvcm0uZGlzcGxheSB8fCAoZm9ybS5kaXNwbGF5ID09PSAnZm9ybScpIHx8IChmb3JtLnBhZ2UgPT09ICRpbmRleClcXFwiXFxuICAgICAgZG5kLWRyYWdnYWJsZT1cXFwiY29tcG9uZW50XFxcIlxcbiAgICAgIGRuZC1lZmZlY3QtYWxsb3dlZD1cXFwibW92ZVxcXCJcXG4gICAgICBkbmQtZHJhZ3N0YXJ0PVxcXCJkbmREcmFnSWZyYW1lV29ya2Fyb3VuZC5pc0RyYWdnaW5nID0gdHJ1ZVxcXCJcXG4gICAgICBkbmQtZHJhZ2VuZD1cXFwiZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQuaXNEcmFnZ2luZyA9IGZhbHNlXFxcIlxcbiAgICAgIGRuZC1tb3ZlZD1cXFwicmVtb3ZlQ29tcG9uZW50KGNvbXBvbmVudCwgZmFsc2UpXFxcIj5cXG4gICAgPGZvcm0tYnVpbGRlci1jb21wb25lbnQgbmctaWY9XFxcIiFjb21wb25lbnQuaGlkZUJ1aWxkZXJcXFwiPjwvZm9ybS1idWlsZGVyLWNvbXBvbmVudD5cXG4gICAgPGRpdiBuZy1pZj1cXFwiZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQuaXNEcmFnZ2luZyAmJiAhZm9ybUNvbXBvbmVudC5ub0RuZE92ZXJsYXlcXFwiIGNsYXNzPVxcXCJkbmRPdmVybGF5XFxcIj48L2Rpdj5cXG4gIDwvbGk+XFxuPC91bD5cXG5cIlxuICAgICk7XG5cbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9mb3JtYnVpbGRlci9yb3cuaHRtbCcsXG4gICAgICBcIjxkaXYgY2xhc3M9XFxcImZvcm1idWlsZGVyLXJvd1xcXCI+XFxuICA8bGFiZWwgbmctaWY9XFxcImNvbXBvbmVudC5sYWJlbFxcXCIgY2xhc3M9XFxcImNvbnRyb2wtbGFiZWxcXFwiPnt7IGNvbXBvbmVudC5sYWJlbCB9fTwvbGFiZWw+XFxuICA8dWwgY2xhc3M9XFxcImNvbXBvbmVudC1yb3cgZm9ybWJ1aWxkZXItZ3JvdXBcXFwiXFxuICAgICAgZG5kLWxpc3Q9XFxcImNvbXBvbmVudC5jb21wb25lbnRzXFxcIlxcbiAgICAgIGRuZC1kcm9wPVxcXCJhZGRDb21wb25lbnQoaXRlbSwgaW5kZXgpXFxcIlxcbiAgICAgIGRuZC1ob3Jpem9udGFsLWxpc3Q9XFxcInRydWVcXFwiPlxcbiAgICA8bGkgbmctcmVwZWF0PVxcXCJjb21wb25lbnQgaW4gY29tcG9uZW50LmNvbXBvbmVudHNcXFwiXFxuICAgICAgICBjbGFzcz1cXFwiZm9ybWJ1aWxkZXItZ3JvdXAtcm93IHB1bGwtbGVmdFxcXCJcXG4gICAgICAgIGRuZC1kcmFnZ2FibGU9XFxcImNvbXBvbmVudFxcXCJcXG4gICAgICAgIGRuZC1lZmZlY3QtYWxsb3dlZD1cXFwibW92ZVxcXCJcXG4gICAgICAgIGRuZC1kcmFnc3RhcnQ9XFxcImRuZERyYWdJZnJhbWVXb3JrYXJvdW5kLmlzRHJhZ2dpbmcgPSB0cnVlXFxcIlxcbiAgICAgICAgZG5kLWRyYWdlbmQ9XFxcImRuZERyYWdJZnJhbWVXb3JrYXJvdW5kLmlzRHJhZ2dpbmcgPSBmYWxzZVxcXCJcXG4gICAgICAgIGRuZC1tb3ZlZD1cXFwicmVtb3ZlQ29tcG9uZW50KGNvbXBvbmVudCwgZmFsc2UpXFxcIj5cXG4gICAgICA8Zm9ybS1idWlsZGVyLWNvbXBvbmVudD48L2Zvcm0tYnVpbGRlci1jb21wb25lbnQ+XFxuICAgICAgPGRpdiBuZy1pZj1cXFwiZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQuaXNEcmFnZ2luZyAmJiAhZm9ybUNvbXBvbmVudC5ub0RuZE92ZXJsYXlcXFwiIGNsYXNzPVxcXCJkbmRPdmVybGF5XFxcIj48L2Rpdj5cXG4gICAgPC9saT5cXG4gICAgPGxpIGNsYXNzPVxcXCJmb3JtYnVpbGRlci1ncm91cC1yb3cgZm9ybS1idWlsZGVyLWRyb3BcXFwiIG5nLWlmPVxcXCJjb21wb25lbnQuY29tcG9uZW50cy5sZW5ndGggPCBoaWRlQ291bnRcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LWluZm9cXFwiIHJvbGU9XFxcImFsZXJ0XFxcIj5cXG4gICAgICAgIERyYWcgYW5kIERyb3AgYSBmb3JtIGNvbXBvbmVudFxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2xpPlxcbiAgPC91bD5cXG4gIDxkaXYgc3R5bGU9XFxcImNsZWFyOmJvdGg7XFxcIj48L2Rpdj5cXG48L2Rpdj5cXG5cIlxuICAgICk7XG5cbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9mb3JtYnVpbGRlci9idWlsZGVyLmh0bWwnLFxuICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJyb3cgZm9ybWJ1aWxkZXJcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwiY29sLXhzLTQgY29sLXNtLTMgY29sLW1kLTIgZm9ybWNvbXBvbmVudHNcXFwiPlxcbiAgICA8dWliLWFjY29yZGlvbiBjbG9zZS1vdGhlcnM9XFxcInRydWVcXFwiPlxcbiAgICAgIDxkaXYgdWliLWFjY29yZGlvbi1ncm91cCBuZy1yZXBlYXQ9XFxcIihncm91cE5hbWUsIGdyb3VwKSBpbiBmb3JtQ29tcG9uZW50R3JvdXBzXFxcIiBoZWFkaW5nPVxcXCJ7eyBncm91cC50aXRsZSB9fVxcXCIgaXMtb3Blbj1cXFwiJGZpcnN0XFxcIiBjbGFzcz1cXFwicGFuZWwgcGFuZWwtZGVmYXVsdCBmb3JtLWJ1aWxkZXItcGFuZWwge3sgZ3JvdXAucGFuZWxDbGFzcyB9fVxcXCI+XFxuICAgICAgICA8dWliLWFjY29yZGlvbiBjbG9zZS1vdGhlcnM9XFxcInRydWVcXFwiIG5nLWlmPVxcXCJncm91cC5zdWJncm91cHNcXFwiPlxcbiAgICAgICAgICA8ZGl2IHVpYi1hY2NvcmRpb24tZ3JvdXAgbmctcmVwZWF0PVxcXCIoc3ViZ3JvdXBOYW1lLCBzdWJncm91cCkgaW4gZ3JvdXAuc3ViZ3JvdXBzXFxcIiBoZWFkaW5nPVxcXCJ7eyBzdWJncm91cC50aXRsZSB9fVxcXCIgaXMtb3Blbj1cXFwiJGZpcnN0XFxcIiBjbGFzcz1cXFwicGFuZWwgcGFuZWwtZGVmYXVsdCBmb3JtLWJ1aWxkZXItcGFuZWwgc3ViZ3JvdXAtYWNjb3JkaW9uXFxcIj5cXG4gICAgICAgICAgICA8ZGl2IG5nLXJlcGVhdD1cXFwiY29tcG9uZW50IGluIGZvcm1Db21wb25lbnRzQnlHcm91cFtncm91cE5hbWVdW3N1Ymdyb3VwTmFtZV1cXFwiIG5nLWlmPVxcXCJjb21wb25lbnQudGl0bGVcXFwiXFxuICAgICAgICAgICAgICAgIGRuZC1kcmFnZ2FibGU9XFxcImNvbXBvbmVudC5zZXR0aW5nc1xcXCJcXG4gICAgICAgICAgICAgICAgZG5kLWRyYWdzdGFydD1cXFwiZG5kRHJhZ0lmcmFtZVdvcmthcm91bmQuaXNEcmFnZ2luZyA9IHRydWVcXFwiXFxuICAgICAgICAgICAgICAgIGRuZC1kcmFnZW5kPVxcXCJkbmREcmFnSWZyYW1lV29ya2Fyb3VuZC5pc0RyYWdnaW5nID0gZmFsc2VcXFwiXFxuICAgICAgICAgICAgICAgIGRuZC1lZmZlY3QtYWxsb3dlZD1cXFwiY29weVxcXCJcXG4gICAgICAgICAgICAgICAgY2xhc3M9XFxcImZvcm1jb21wb25lbnRjb250YWluZXJcXFwiPlxcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4teHMgYnRuLWJsb2NrIGZvcm1jb21wb25lbnRcXFwiIHRpdGxlPVxcXCJ7e2NvbXBvbmVudC50aXRsZX19XFxcIiBzdHlsZT1cXFwib3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxcIj5cXG4gICAgICAgICAgICAgICAgPGkgbmctaWY9XFxcImNvbXBvbmVudC5pY29uXFxcIiBjbGFzcz1cXFwie3sgY29tcG9uZW50Lmljb24gfX1cXFwiPjwvaT4ge3sgY29tcG9uZW50LnRpdGxlIH19XFxuICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC91aWItYWNjb3JkaW9uPlxcbiAgICAgICAgPGRpdiBuZy1yZXBlYXQ9XFxcImNvbXBvbmVudCBpbiBmb3JtQ29tcG9uZW50c0J5R3JvdXBbZ3JvdXBOYW1lXVxcXCIgbmctaWY9XFxcIiFncm91cC5zdWJncm91cCAmJiBjb21wb25lbnQudGl0bGVcXFwiXFxuICAgICAgICAgICAgZG5kLWRyYWdnYWJsZT1cXFwiY29tcG9uZW50LnNldHRpbmdzXFxcIlxcbiAgICAgICAgICAgIGRuZC1kcmFnc3RhcnQ9XFxcImRuZERyYWdJZnJhbWVXb3JrYXJvdW5kLmlzRHJhZ2dpbmcgPSB0cnVlXFxcIlxcbiAgICAgICAgICAgIGRuZC1kcmFnZW5kPVxcXCJkbmREcmFnSWZyYW1lV29ya2Fyb3VuZC5pc0RyYWdnaW5nID0gZmFsc2VcXFwiXFxuICAgICAgICAgICAgZG5kLWVmZmVjdC1hbGxvd2VkPVxcXCJjb3B5XFxcIlxcbiAgICAgICAgICAgIGNsYXNzPVxcXCJmb3JtY29tcG9uZW50Y29udGFpbmVyXFxcIj5cXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4teHMgYnRuLWJsb2NrIGZvcm1jb21wb25lbnRcXFwiIHRpdGxlPVxcXCJ7e2NvbXBvbmVudC50aXRsZX19XFxcIiBzdHlsZT1cXFwib3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxcIj5cXG4gICAgICAgICAgICA8aSBuZy1pZj1cXFwiY29tcG9uZW50Lmljb25cXFwiIGNsYXNzPVxcXCJ7eyBjb21wb25lbnQuaWNvbiB9fVxcXCI+PC9pPiB7eyBjb21wb25lbnQudGl0bGUgfX1cXG4gICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgPC9kaXY+XFxuICAgIDwvdWliLWFjY29yZGlvbj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiY29sLXhzLTggY29sLXNtLTkgY29sLW1kLTEwIGZvcm1hcmVhXFxcIj5cXG4gICAgPG9sIGNsYXNzPVxcXCJicmVhZGNydW1iXFxcIiBuZy1pZj1cXFwiZm9ybS5kaXNwbGF5ID09PSAnd2l6YXJkJ1xcXCI+XFxuICAgICAgPGxpIG5nLXJlcGVhdD1cXFwidGl0bGUgaW4gcGFnZXMoKSB0cmFjayBieSAkaW5kZXhcXFwiPjxhIGNsYXNzPVxcXCJsYWJlbFxcXCIgc3R5bGU9XFxcImZvbnQtc2l6ZToxZW07XFxcIiBuZy1jbGFzcz1cXFwieydsYWJlbC1pbmZvJzogKCRpbmRleCA9PT0gZm9ybS5wYWdlKSwgJ2xhYmVsLXByaW1hcnknOiAoJGluZGV4ICE9PSBmb3JtLnBhZ2UpfVxcXCIgbmctY2xpY2s9XFxcInNob3dQYWdlKCRpbmRleClcXFwiPnt7IHRpdGxlIH19PC9hPjwvbGk+XFxuICAgICAgPGxpPjxhIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1zdWNjZXNzXFxcIiBzdHlsZT1cXFwiZm9udC1zaXplOjFlbTtcXFwiIG5nLWNsaWNrPVxcXCJuZXdQYWdlKClcXFwiIGRhdGEtdG9nZ2xlPVxcXCJ0b29sdGlwXFxcIiB0aXRsZT1cXFwiQ3JlYXRlIFBhZ2VcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBsdXNcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+IHBhZ2U8L2E+PC9saT5cXG4gICAgPC9vbD5cXG4gICAgPGRpdiBjbGFzcz1cXFwiZHJvcHpvbmVcXFwiPlxcbiAgICAgIDxmb3JtLWJ1aWxkZXItbGlzdCBjb21wb25lbnQ9XFxcImZvcm1cXFwiIGZvcm09XFxcImZvcm1cXFwiIGZvcm1pbz1cXFwiOjpmb3JtaW9cXFwiIGhpZGUtZG5kLWJveC1jb3VudD1cXFwiaGlkZUNvdW50XFxcIiByb290LWxpc3Q9XFxcInRydWVcXFwiIGNsYXNzPVxcXCJyb290bGlzdFxcXCI+PC9mb3JtLWJ1aWxkZXItbGlzdD5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG5cIlxuICAgICk7XG5cbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2Zvcm1pby9mb3JtYnVpbGRlci9kYXRhZ3JpZC5odG1sJyxcbiAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZGF0YWdyaWQtZG5kIGRyb3B6b25lXFxcIiBuZy1jb250cm9sbGVyPVxcXCJmb3JtQnVpbGRlckRuZFxcXCI+XFxuICA8bGFiZWwgbmctaWY9XFxcImNvbXBvbmVudC5sYWJlbFxcXCIgY2xhc3M9XFxcImNvbnRyb2wtbGFiZWxcXFwiPnt7IGNvbXBvbmVudC5sYWJlbCB9fTwvbGFiZWw+XFxuICA8dGFibGUgY2xhc3M9XFxcInRhYmxlIGRhdGFncmlkLXRhYmxlXFxcIiBuZy1jbGFzcz1cXFwieyd0YWJsZS1zdHJpcGVkJzogY29tcG9uZW50LnN0cmlwZWQsICd0YWJsZS1ib3JkZXJlZCc6IGNvbXBvbmVudC5ib3JkZXJlZCwgJ3RhYmxlLWhvdmVyJzogY29tcG9uZW50LmhvdmVyLCAndGFibGUtY29uZGVuc2VkJzogY29tcG9uZW50LmNvbmRlbnNlZH1cXFwiPlxcbiAgICA8dHI+XFxuICAgICAgPHRoIHN0eWxlPVxcXCJwYWRkaW5nOjMwcHggMCAxMHB4IDBcXFwiIG5nLXJlcGVhdD1cXFwiY29tcG9uZW50IGluIGNvbXBvbmVudC5jb21wb25lbnRzXFxcIiBuZy1jbGFzcz1cXFwieydmaWVsZC1yZXF1aXJlZCc6IGNvbXBvbmVudC52YWxpZGF0ZS5yZXF1aXJlZH1cXFwiPlxcbiAgICAgICAge3sgKGNvbXBvbmVudC5sYWJlbCB8fCAnJykgfCBmb3JtaW9UcmFuc2xhdGU6bnVsbDpidWlsZGVyIH19XFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCJkbmREcmFnSWZyYW1lV29ya2Fyb3VuZC5pc0RyYWdnaW5nICYmICFmb3JtQ29tcG9uZW50Lm5vRG5kT3ZlcmxheVxcXCIgY2xhc3M9XFxcImRuZE92ZXJsYXlcXFwiPjwvZGl2PlxcbiAgICAgIDwvdGg+XFxuICAgIDwvdHI+XFxuICAgIDx0clxcbiAgICAgIGNsYXNzPVxcXCJjb21wb25lbnQtbGlzdFxcXCJcXG4gICAgICBkbmQtbGlzdD1cXFwiY29tcG9uZW50LmNvbXBvbmVudHNcXFwiXFxuICAgICAgZG5kLWRyb3A9XFxcImFkZENvbXBvbmVudChpdGVtLCBpbmRleClcXFwiXFxuICAgID5cXG4gICAgICA8dGRcXG4gICAgICAgIG5nLXJlcGVhdD1cXFwiY29tcG9uZW50IGluIGNvbXBvbmVudC5jb21wb25lbnRzXFxcIlxcbiAgICAgICAgbmctaW5pdD1cXFwiaGlkZU1vdmVCdXR0b24gPSB0cnVlOyBjb21wb25lbnQuaGlkZUxhYmVsID0gdHJ1ZVxcXCJcXG4gICAgICAgIGRuZC1kcmFnZ2FibGU9XFxcImNvbXBvbmVudFxcXCJcXG4gICAgICAgIGRuZC1lZmZlY3QtYWxsb3dlZD1cXFwibW92ZVxcXCJcXG4gICAgICAgIGRuZC1kcmFnc3RhcnQ9XFxcImRuZERyYWdJZnJhbWVXb3JrYXJvdW5kLmlzRHJhZ2dpbmcgPSB0cnVlXFxcIlxcbiAgICAgICAgZG5kLWRyYWdlbmQ9XFxcImRuZERyYWdJZnJhbWVXb3JrYXJvdW5kLmlzRHJhZ2dpbmcgPSBmYWxzZVxcXCJcXG4gICAgICAgIGRuZC1tb3ZlZD1cXFwicmVtb3ZlQ29tcG9uZW50KGNvbXBvbmVudCwgZmFsc2UpXFxcIlxcbiAgICAgID5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbXBvbmVudC1mb3JtLWdyb3VwIGNvbXBvbmVudC10eXBlLXt7IGNvbXBvbmVudC50eXBlIH19IGZvcm0tYnVpbGRlci1jb21wb25lbnRcXFwiPlxcbiAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJoYXMtZmVlZGJhY2sgZm9ybS1maWVsZC10eXBlLXt7IGNvbXBvbmVudC50eXBlIH19IHt7Y29tcG9uZW50LmN1c3RvbUNsYXNzfX1cXFwiIGlkPVxcXCJmb3JtLWdyb3VwLXt7IGNvbXBvbmVudC5rZXkgfX1cXFwiIHN0eWxlPVxcXCJwb3NpdGlvbjppbmhlcml0XFxcIiBuZy1zdHlsZT1cXFwiY29tcG9uZW50LnN0eWxlXFxcIj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpbnB1dC1ncm91cFxcXCI+XFxuICAgICAgICAgICAgICA8Zm9ybS1idWlsZGVyLWNvbXBvbmVudD48L2Zvcm0tYnVpbGRlci1jb21wb25lbnQ+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgPC90ZD5cXG4gICAgICA8dGQgbmctaWY9XFxcImNvbXBvbmVudC5jb21wb25lbnRzLmxlbmd0aCA9PT0gMFxcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJhbGVydCBhbGVydC1pbmZvXFxcIiByb2xlPVxcXCJhbGVydFxcXCI+XFxuICAgICAgICAgIERhdGFncmlkIENvbXBvbmVudHNcXG4gICAgICAgIDwvZGl2PlxcbiAgICAgIDwvdGQ+XFxuICAgIDwvdHI+XFxuICA8L3RhYmxlPlxcbiAgPGRpdiBzdHlsZT1cXFwiY2xlYXI6Ym90aDtcXFwiPjwvZGl2PlxcbjwvZGl2PlxcblwiXG4gICAgKTtcblxuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnZm9ybWlvL2NvbXBvbmVudHMvY29uZmlybS1yZW1vdmUuaHRtbCcsXG4gICAgICBcIjxmb3JtIGlkPVxcXCJjb25maXJtLXJlbW92ZS1kaWFsb2dcXFwiPlxcbiAgPHA+UmVtb3ZpbmcgdGhpcyBjb21wb25lbnQgd2lsbCBhbHNvIDxzdHJvbmc+cmVtb3ZlIGFsbCBvZiBpdHMgY2hpbGRyZW48L3N0cm9uZz4hIEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkbyB0aGlzPzwvcD5cXG4gIDxkaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcbiAgICAgIDxidXR0b24gdHlwZT1cXFwic3VibWl0XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kYW5nZXIgcHVsbC1yaWdodFxcXCIgbmctY2xpY2s9XFxcImNsb3NlVGhpc0RpYWxvZyh0cnVlKVxcXCI+UmVtb3ZlPC9idXR0b24+Jm5ic3A7XFxuICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgcHVsbC1yaWdodFxcXCIgc3R5bGU9XFxcIm1hcmdpbi1yaWdodDogNXB4O1xcXCIgbmctY2xpY2s9XFxcImNsb3NlVGhpc0RpYWxvZyhmYWxzZSlcXFwiPkNhbmNlbDwvYnV0dG9uPiZuYnNwO1xcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZm9ybT5cXG5cIlxuICAgICk7XG4gIH1cbl0pO1xuXG5yZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcbiJdfQ==
