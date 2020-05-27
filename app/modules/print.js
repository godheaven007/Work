/**
 * 打印
 */
layui.define(function (exports) {
    var $ = layui.jquery;

    var opt,
        browser = {
            mozilla: /firefox/.test(navigator.userAgent.toLowerCase()),
            webkit: /webkit/.test(navigator.userAgent.toLowerCase()),
            opera: /opera/.test(navigator.userAgent.toLowerCase()),
            msie: /msie/.test(navigator.userAgent.toLowerCase())
        },
        defaults = {
            debug: false,
            importCSS: true,
            printContainer: true,
            operaSupport: true
        };


    function print($element, options) {

        opt = $.extend({}, defaults, options);

        if (opt.operaSupport && browser.opera) {
            var tab = window.open("", "print-preview");
            tab.document.open();

            var doc = tab.document;
        }
        else {
            var $iframe = $("<iframe  />");

            if (!opt.debug) {
                $iframe.css({
                    position: "absolute",
                    width: "0px",
                    height: "0px",
                    left: "-600px",
                    top: "-600px"
                });
            }

            $iframe.appendTo("body");
            try {
                var doc = $iframe[0].contentWindow.document;
            } catch (err) {
                $iframe[0].src = "javascript:void((function(){document.open();document.domain='" + document.domain + "';document.close()})())";
                var doc = $iframe[0].contentWindow.document;
            }

        }

        if (opt.importCSS) {
            if ($("link[media=print]").length > 0) {
                $("link[media=print]").each(function () {
                    $(doc).find('body').append("<link type='text/css' rel='stylesheet' href='" + $(this).attr("href") + "' media='print' />");
                });
            }
            else {
                $("link").each(function () {
                    $(doc).find('body').append("<link type='text/css' rel='stylesheet' href='" + $(this).attr("href") + "' />");
                });
            }
        }

        if (opt.printContainer) {
            $(doc).find('body').append(outer($element));
        }
        else {
            $element.each(function () {
                $(doc).find('body').append($(this).html());
            });
        }

        doc.close();

        (opt.operaSupport && browser.opera ? tab : $iframe[0].contentWindow).focus();
        setTimeout(function () {
            (opt.operaSupport && browser.opera ? tab : $iframe[0].contentWindow).print();
            if (tab) {
                tab.close();
            }
        }, 1000);
    };

    function outer($target) {
        return $($('<div></div>').html($target.clone())).html();
    }

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Print', print);
});