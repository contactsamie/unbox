(function (w) {
    var _dependency = function () { };
    var pDepend = _dependency.prototype;
    var logger = function (o) {
       // console.log(o);
    };

    var errorLog = function (o) {
        console.error(o);
    };
    var warnLog = function (o) {
        console.warn(o);
    };
    var errorCodes = {
        falsyInput: "Invalid input parameter",
        wrongDependency: "Suplied dependency does not exist"
    };
    var utility = {
        basicInputValidation: function (i, types) {
            i || errorLog(errorCodes.falsyInput);
        },
        trim: function (s) {
            return s.replace(/^\s+|\s+$/g, '');
        }
    };
    var modules = {};
    var BASE = {};
    modules.names = {};
    modules.dependencies = {};
    var dependencyFactory = function (d) {
        var dependsOn = [];
        for (var i = 0; i < d.length; i++) {
            var _dep = modules.dependencies[d[i]];

            _dep ? dependsOn.push(_dep) : warnLog(errorCodes.wrongDependency);
        }
        return dependsOn;
    };
    var thisDependencyInjection = {
    };

    var pullApartMethod = function (m) {
        var mA = m.match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m);
        var arg = mA[1].split(',');
        return {
            arg: arg
        }
    };
    var iiException = function (m) {
        this.message = m;
    };
    var dependencyExtractor = function (str) {
        var arg = (pullApartMethod(str)).arg;
        for (var i = 0; i < arg.length; i++) {
            arg[i] = utility.trim(arg[i]);
        }

        return arg;
    }

    var dependencyMethodFactory = function (obj, f, dependency) {
        logger("building dependencies ....");

        logger(f);

        var methdBuilder = "function(" + dependency.toString() + "){\n\n " + w.unbox.module.mgmt.getDeclareList(obj.me).code + "\n\n  return (" + f.toString() + ")(); \n\n  }";
        logger("executing ...");
        logger(methdBuilder);
        eval("var fInject=" + methdBuilder);
        logger(fInject);
        return fInject;
    };
    var controllerFactory = function (obj, methodRef) {
        var execute = function (f) {
            var executionResult = undefined;
            var iDependsOn = methodRef && (w.unbox.module.mgmt.getDependency(obj.me, methodRef))["dependencyList"];//  w.unbox.module.all[obj.me]["dependencies"];

            utility.basicInputValidation(f);
            var dependsOn = {};
            var dependency = [];
            if (iDependsOn) {
                logger("injecting alternate api: arg:");
                dependency = iDependsOn;
            } else {
                dependency = dependencyExtractor(f.toString());
                logger("injecting default api: arg:");
            }
            logger(dependency);
            dependsOn = dependencyFactory(dependency);
            logger(dependsOn);
            //logger(f);
            try {
                var fInject = function () { };
                if (iDependsOn) {
                    fInject = dependencyMethodFactory(obj, f, dependency);
                }
                logger("with..");
                logger(dependsOn);
                var root = w.unbox.module.mgmt.getRoot(obj.me);
                logger("at root space ...");
                logger(root);
                root.current(fInject);
                executionResult = root.current.space.apply(null, dependsOn);
                logger(root.current);
                logger("method executes well ......................................................");
            } catch (exc) {
                errorLog("exception occured while executing mehod");
                errorLog(exc);
            }

            return executionResult;
        };

        obj = obj || {};

        obj.run = execute;

        return obj;
    }
    var injectionFactory = function (name, that, methodDependency) {
        return function () {
            var rArguments = [];
            for (var i = 0; i < arguments.length; i++) {
                rArguments.push(arguments[i].toString());
            }
            logger(rArguments);
            // w.unbox.module.all[name]["dependencies"] = rArguments;

            methodRef = w.unbox.module.mgmt.setDependency(name, rArguments);

            return controllerFactory(that, methodRef);
        };
    };
    var ModuleFactory = function (name) {
        modules.names[name] = new _dependency();
        var d = modules.names[name];
        d = controllerFactory(d);
        d.me = name;
        d.declare = function (item) {
            w.unbox.module.mgmt.pushDeclare(name, item);
            this.declare.variables = item;
            return this;
        }
        d.inject = injectionFactory(name, d);

        return d;
    };

    pDepend.getDependencies = function () {
        return modules.dependencies;
    };
    pDepend.me = "";
    pDepend.method = function (name, f) {
        utility.basicInputValidation(typeof f === "function");
        utility.basicInputValidation(name);
        name = utility.trim(name);
        modules.dependencies[name] = f;
        logger("injected .." + name);
        logger(modules.dependencies);
        return this;
    };
    w.unbox = function (name) {
        if (typeof name === "string") {
            logger(name + " module finding");
            if (w.unbox.module.all[name]) {
                logger(name + " module found");
                return w.unbox.module.all[name]["build"];
            } else {
                logger(name + " module does not exist");
                logger("creating " + name + " module ......");
                return w.unbox.module(name);
            }
        } else {
            throw new iiException("module reference error");
        }
    };
    w.unbox.module = function (name) {
        w.unbox.module.all = w.unbox.module.all || {};

        if (typeof name === "string") {
            name = utility.trim(name);
            if (w.unbox.module.all[name]) {
                throw new iiException(name + " module already exist");
            } else {
                utility.basicInputValidation(name);
                name = utility.trim(name);
                var build = ModuleFactory(name);

                w.unbox.module.all[name] = {
                    build: build, dependencies: {}, root: {
                        space: {
                            current: function (f) {
                                logger("current method running:%%%%%%%%%%%%%%%%%");
                                logger(f);
                                this.current.space = f;
                            }
                        }, declare: {}
                    }
                };
                logger(w.unbox.module.all[name]["build"]);
                return build;
            }
        }
    };
    w.unbox.module.all = {};
    w.unbox.module.mgmt = {
        methodCounter: function () {
            w.unbox.module.mgmt.methodCounter.i = w.unbox.module.mgmt.methodCounter.i || 0;
            w.unbox.module.mgmt.methodCounter.i++;
            return "methodId" + w.unbox.module.mgmt.methodCounter.i;
        },
        getDependency: function (moduleName, methodRef) {
            w.unbox.module.all[moduleName]["dependencies"] = w.unbox.module.all[moduleName]["dependencies"] || {};
            return w.unbox.module.all[moduleName]["dependencies"][methodRef];
        },
        setDependency: function (moduleName, methodNames) {
            var result = false;
            if (w.unbox.module.all[moduleName] && w.unbox.module.all[moduleName]["dependencies"]) {
                var mathodRef = this.methodCounter();
                w.unbox.module.all[moduleName]["dependencies"][mathodRef] = {
                    refName: mathodRef,
                    dependencyList: methodNames,
                    dependencyStore: {}
                };

                for (var i = 0; i < methodNames.length; i++) {
                    var methodName = methodNames[i];
                    if (methodName) {
                        w.unbox.module.all[moduleName]["dependencies"][mathodRef]["dependencyStore"][methodName] = function () { };
                    }
                }

                result = mathodRef
            }
            return result;
        },
        pushDeclare: function (moduleName, rootItem) {
            if (rootItem) {
                w.unbox.module.all[moduleName]["root"]["declare"] = rootItem;
            }
            return w.unbox.module.all[moduleName]["root"]["declare"];
        },
        getDeclareList: function (moduleName) {
            var obj = w.unbox.module.all[moduleName]["root"]["declare"];
            var declStr = {
                code: "",
                parameters: "window"
            };

            for (var item in obj) {
                if (obj.hasOwnProperty(item)) {
                    declStr.code += "\nvar " + item + "=" + "window.unbox('" + moduleName + "').declare.variables." + item + ";";
                    declStr.parameters += "," + item + "\n\n";
                }
            }
            return declStr;
        },
        getRoot: function (moduleName) {
            return w.unbox.module.all[moduleName]["root"]["space"];
        },
        getBuild: function (moduleName) { },
        setBuild: function (moduleName, build) { }
    };
})(window);