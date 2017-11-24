'use strict';
const Generator = require('yeoman-generator');
const pkg = require('../../package.json');
const extend = require('deep-extend');
const {getBanner} = require('../lib/text');

module.exports = class extends Generator {
  initializing() {
    this.props = {};
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(getBanner(pkg));

    const prompts = [
      {
        name: 'packageName',
        message: 'Package name (part of Package.widget.WidgetName)',
        default: 'Package',
        when: !this.props.packageName
      },
      {
        name: 'widgetName',
        message: 'Widget name (part of Package.widget.WidgetName)',
        default: 'Widget',
        when: !this.props.widgetName
      },
      {
        name: 'friendlyWidgetName',
        message: 'Friendly widget name (in Modeler)',
        default: 'Widget',
        when: !this.props.friendlyWidgetName
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  _copySourceFile(path) {
    this.fs.copy(this.templatePath(`widget-base/${path}`), this.destinationPath(path));
  }

  writing() {
    const {
      packageName,
      widgetName,
      friendlyWidgetName
    } = this.props;

    this._copySourceFile('.babelrc');
    this._copySourceFile('.editorconfig');
    this._copySourceFile('.eslintignore');
    this._copySourceFile('.eslintrc');
    this._copySourceFile('.gitignore');
    this._copySourceFile('Gulpfile.js');
    this._copySourceFile('postcss.config.js');
    this._copySourceFile('webpack.config.js');
    this._copySourceFile('widgetpackage.template.xml.ejs');

    this.fs.copy(
      this.templatePath(`widget-base/src/Widget/Widget.xml`),
      this.destinationPath(`src/${packageName}/${widgetName}.xml`),
      {
        process: file => {
          let fileText = file.toString();
          fileText = fileText
            .replace(/Widget\.widget\.Widget/g, `${packageName}.widget.${widgetName}`)
            .replace(/<name>Widget<\/name>/g, `<name>${friendlyWidgetName}</name>`);
          return fileText;
        }
      }
    );

    this.fs.copy(
      this.templatePath(`widget-base/src/Widget/widget/Widget.js`),
      this.destinationPath(`src/${packageName}/widget/${widgetName}.js`),
      {
        process: file => {
          let fileText = file.toString();
          fileText = fileText
            .replace(/'Widget'/g, `'${widgetName}'`);
          return fileText;
        }
      }
    );

    this.fs.copy(
      this.templatePath(`widget-base/src/Widget/widget/Widget.scss`),
      this.destinationPath(`src/${packageName}/widget/${widgetName}.scss`)
    );

    this.fs.copy(
      this.templatePath(`widget-base/src/Widget/widget/Widget.template.html`),
      this.destinationPath(`src/${packageName}/widget/${widgetName}.template.html`),
    );

    this.fs.copy(
      this.templatePath(`widget-base/src/Widget/widget/Core.js`),
      this.destinationPath(`src/${packageName}/widget/Core.js`)
    );
    this.fs.copy(
      this.templatePath(`widget-base/src/Widget/widget/Libraries.js`),
      this.destinationPath(`src/${packageName}/widget/Libraries.js`)
    );

    const source = this.fs.readJSON(this.templatePath(`widget-base/package.json`));

    extend(source, {
      widget: {
        package: packageName,
        libraries: false,
        core: false,
        path: false
      }
    });

    this.fs.writeJSON(this.destinationPath('package.json'), source);
  }

  install() {
    this.installDependencies({bower: false});
  }
};
