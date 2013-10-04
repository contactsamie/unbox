test("unbox library API consistency test - direct instanciation methods", function () {
    ok(unbox, "unbox object must be available in global space");
    ok(typeof unbox === "function", "unbox object is a function");
    ok(unbox.module, "unbox.module must be accessible");
    ok(typeof unbox.module === "function", "unbox.module must be a function");
    ok(unbox("a1"), "an instance of unbox is possible via unbox()");
    ok(unbox("myName").me === "myName", "the module name must be retrievable from 'me' object off of  unbox()");

    ok(typeof unbox("a2").method === "function", "an instance of unbox() has a function 'method' off of it");

    ok(typeof unbox("a31").inject === "function", "an instance of unbox() has a function 'inject' off of it");

    ok(typeof unbox("a32").run === "function", "an instance of unbox() has a function 'run' off of it");

    ok(typeof unbox("a4").method("b1").inject === "function", "an instance of unbox() has a function 'method().inject' off of it");

    ok(typeof unbox("a5").method("b2").run === "function", "an instance of unbox() has a function 'method().run' off of it");

    ok(typeof unbox("a6").inject("b3").run === "function", "an instance of unbox() has a function 'inject().run' off of it");
    ok(typeof unbox("a7").inject("b4").method === "function", "an instance of unbox() has a function 'inject().method' off of it");

    ok(typeof unbox("a8").run(function () { }) === "undefined", "an instance of unbox().run has NO object  off of it");

    ok(typeof unbox("a33").declare === "function", "an instance of unbox() has a function 'attatch' off of it");
    ok(typeof unbox("a34").declare(function () { }).run === "function", "an instance of unbox().attatch has a function 'run' off of it");
    ok(typeof unbox("a35").declare(function () { }).method === "function", "an instance of unbox().attatch has a function 'method' off of it");
    ok(typeof unbox("a36").declare(function () { }).inject === "function", "an instance of unbox().attatch has a function 'inject' off of it");
});

test("It is possibe to make run() pass object set in declare() to method," +
    " and the method should run as specified by that method - With compound  instanciation patterns of unbox", function () {
        var testMethodToInject = function (parameter) { return typeof parameter === "function" ? parameter(100) : (parameter + 100); };
        var expected = function (current) { return testMethodToInject(current); };
        expected.declarations = [
            "-3", "-2", "-1", " 0", 00, 0.0, 0.1, 12.34, 0.0005,
            "a", "b", "c", "d", "e", "f", "h",
            function (a) { return a * 3; }, function (a) { return a + "sam"; }, function () { },
            ["1"], {}, []
        ];
        var methods = {};
        for (var j = -100; j < 100; j++) {
            expected.declarations.push(j);
            expected.declarations.push({ number: j });
            expected.declarations.push([j]);

            eval(" methods['fun_" + j + "']=function(a){return a+" + j + ";}");
            expected.declarations.push(methods["fun_" + j]);
        }

        var total = expected.declarations.length;

        for (var i = 0; i < total; i++) {
            var expecting = expected(expected.declarations[i]);

            var result1 =
                unbox("module1").
                declare({ variable: expected.declarations[i] }).
                method("method", testMethodToInject).
                inject("method").
                run(function () { return method(variable); });
            ok(result1 === expecting,
               "MODULE " + unbox("method").me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result1 +
                " when  chain unbox().declare().method().inject().run() , declare()'s param is accessible in run() which inject() injects with method()'s param");

            var module2 = unbox("module2");
            var result2 =
               module2.
               declare({ variable: expected.declarations[i] }).
               method("method", testMethodToInject).
               inject("method").
               run(function () { return method(variable); });
            ok(result2 === expecting,
              "MODULE " + module2.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result2 +
                " when   chain  var module = unbox('module'); module.declare().method().inject().run() , declare()'s param is accessible in " +
                " run() which inject() injects with method()'s param");

            var module3 = unbox("module3").declare({ variable: expected.declarations[i] });
            var result3 =
               module3.
               method("method", testMethodToInject).
               inject("method").
               run(function () { return method(variable); });
            ok(result3 === expecting,
              "MODULE " + module3.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result3 +
                " when   chain  var module = unbox('module').declare(); module.method().inject().run() , declare()'s param is accessible in " +
                "  run() which inject() injects with method()'s param");

            var module4 = unbox("module4").declare({ variable: expected.declarations[i] }).method("method", testMethodToInject);
            var result4 =
               module4.
               inject("method").
               run(function () { return method(variable); });
            ok(result4 === expecting,
               "MODULE " + module4.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result4 +
                " when   chain  var module = unbox('module').declare().method(); module.inject().run() , declare()'s param is accessible in " +
                "  run() which inject() injects with method()'s param");

            var module5 = unbox("module5").declare({ variable: expected.declarations[i] }).method("method", testMethodToInject).inject("method");
            var result5 =
               module5.
               run(function () { return method(variable); });
            ok(result5 === expecting,
              "MODULE " + module5.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result5 +
                " when   chain  var module = unbox('module').declare().method().inject(); module.run() , declare()'s param is accessible in " +
                "  run() which inject() injects with method()'s param");

            var module6 = unbox("module6");
            module6.declare({ variable: expected.declarations[i] });
            module6.method("method", testMethodToInject);
            module6.inject("method");
            var result6 = module6.run(function () { return method(variable); });
            ok(result6 === expecting,
                "MODULE " + module6.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result6 +
                " when pattern of instantiation is  var module = unbox('module');/ module.declare();/ module.method();/ module.inject();/ module.run() , declare()'s param is accessible in " +
                "  run() which inject() injects with method()'s param");

            var module7 = unbox("module7");
            module7.declare({ variable: expected.declarations[i] });
            module7.inject("method");
            module7.method("method", testMethodToInject);

            var result7 = module7.run(function () { return method(variable); });
            ok(result7 === expecting,
                "MODULE " + module7.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result7 +
                "  YOU CAN INJECT BEFORE SPECIFYING THE METHOD TO BE INJECTED");

            unbox("module77").declare({ variable: expected.declarations[i] });
            unbox("module77").inject("method");
            unbox("module77").method("method", testMethodToInject);

            var result77 = unbox("module77").run(function () { return method(variable); });
            ok(result77 === expecting,
                "USING unbox('module') as instance,  MODULE " + unbox("module77").me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result77 +
                "  YOU CAN INJECT BEFORE SPECIFYING THE METHOD TO BE INJECTED");

            var module8 = unbox("module8");

            module8.inject("method");
            module8.method("method", testMethodToInject);
            module8.declare({ variable: expected.declarations[i] });
            var result8 = module8.run(function () { return method(variable); });
            ok(result8 === expecting,
                "MODULE " + module8.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result8 +
                "  YOU CAN DECLARE VARIABLES JUST BEFORE RUN AND AFTER EVERY THING ELSE");

            unbox("module88").inject("method");
            unbox("module88").method("method", testMethodToInject);
            unbox("module88").declare({ variable: expected.declarations[i] });
            var result88 = unbox("module88").run(function () { return method(variable); });
            ok(result88 === expecting,
               "USING unbox('module') as instance,  MODULE " + unbox("module88").me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result88 +
                "  YOU CAN DECLARE VARIABLES JUST BEFORE RUN AND AFTER EVERY THING ELSE");

            var module9 = unbox("module9");
            module9.inject("method");
            module9.declare({ variable: expected.declarations[i] });
            module9.method("method", testMethodToInject);
            var result9 = module9.run(function () { return method(variable); });
            ok(result9 === expecting,
                "MODULE " + module9.me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result9 +
                "  YOU CAN DECLARE VARIABLES AFTER INJECT AND BEFORE METHOD AND AFTER EVERY THING ELSE");

            unbox("module99").inject("method");
            unbox("module99").declare({ variable: expected.declarations[i] });
            unbox("module99").method("method", testMethodToInject);
            var result99 = unbox("module99").run(function () { return method(variable); });
            ok(result99 === expecting,
               "USING unbox('module') as instance,  MODULE " + unbox("module99").me + " - with 'declaration({v:" + expected.declarations[i] + "})'  " + "expecting " + expecting + " but got " + result99 +
                "  YOU CAN DECLARE VARIABLES AFTER INJECT AND BEFORE METHOD AND AFTER EVERY THING ELSE");
        }
    });

test("unbox dependency injection test - Accessing 'declare' parameters from 'run'", function () {
    var testModule = unbox("myModule1");
    testModule.declare({
        init: 10,
        parameter: 100
    });
    testModule.method("testMethod1", function (arg1, arg2) {
        return arg1 + arg2;
    });
    testModule.inject("testMethod1");

    var result = testModule.run(function () {
        var result = testMethod1(parameter, init);
        return result;
    });
    ok(result === 110, "When properties are declared using the declare method, those properties must be available in 'method' and 'run' ");

});

test("unbox dependency injection test - Accessing 'declare' parameters from 'method'", function () {
    var testModule = unbox("myModule2");
    testModule.declare({
        init: 10,
        parameter: 100
    });
    testModule.method("testMethod2", function () {
        return init;
    });
    testModule.inject("testMethod2");

    var result = testModule.run(function () {
        var result = testMethod2();
        return result;
    });
    ok(result === undefined, "When properties are declared using the declare method, those properties must NOT be available in 'method' and 'method' ");

});