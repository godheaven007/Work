define("widget/layer/1.8.5/layer", [], function(require, exports, module) {
    require.async("widget/layer/1.8.5/layer.css");
    return function(jquery) {
        (function($) {
            ! function(window, undefined) {
                var path = "",
                    $, win, ready = {
                        getPath: function() {
                            var js = document.scripts,
                                jsPath = js[js.length - 1].src;
                            return path ? path : jsPath.substring(0, jsPath.lastIndexOf("/") + 1)
                        },
                        type: ["dialog", "page", "iframe", "loading", "tips"]
                    };

                if(window.layer && window.layer.v == '1.8.5') return false;
                window.layer = {
                    v: "1.8.5",
                    ie6: !!window.ActiveXObject && !window.XMLHttpRequest,
                    index: 0,
                    path: ready.getPath(),
                    use: function(module, callback) {
                        var i = 0,
                            head = $("head")[0];
                        var module = module.replace(/\s/g, "");
                        var iscss = /\.css$/.test(module);
                        var node = document.createElement(iscss ? "link" : "script");
                        var id = module.replace(/\.|\//g, "");
                        if (iscss) {
                            node.type = "text/css";
                            node.rel = "stylesheet"
                        }
                        node[iscss ? "href" : "src"] = /^http:\/\//.test(module) ? module : layer.path + module;
                        node.id = id;
                        if (!$("#" + id)[0]) {
                            head.appendChild(node)
                        }
                        if (callback) {
                            if (document.all) {
                                $(node).ready(callback)
                            } else {
                                $(node).load(callback)
                            }
                        }
                    },
                    alert: function(msg, icon, fn, yes) {
                        var isfn = (typeof fn === "function"),
                            conf = {
                                dialog: {
                                    msg: msg,
                                    type: icon,
                                    yes: isfn ? fn : yes
                                },
                                area: ["auto", "auto"]
                            };
                        isfn || (conf.title = fn);
                        return $.layer(conf)
                    },
                    confirm: function(msg, yes, fn, no) {
                        var isfn = (typeof fn === "function"),
                            conf = {
                                dialog: {
                                    msg: msg,
                                    type: 4,
                                    btns: 2,
                                    yes: yes,
                                    no: isfn ? fn : no
                                }
                            };
                        isfn || (conf.title = fn);
                        return $.layer(conf)
                    },
                    msg: function(msg, time, parme, end) {
                        var conf = {
                            title: false,
                            closeBtn: false,
                            time: time === undefined ? 2 : time,
                            dialog: {
                                msg: (msg === "" || msg === undefined) ? "&nbsp;" : msg
                            },
                            end: end
                        };
                        if (typeof parme === "object") {
                            conf.dialog.type = parme.type;
                            conf.shade = parme.shade;
                            conf.shift = parme.rate
                        } else {
                            if (typeof parme === "function") {
                                conf.end = parme
                            } else {
                                conf.dialog.type = parme
                            }
                        }
                        return $.layer(conf)
                    },
                    load: function(parme, icon) {
                        if (typeof parme === "string") {
                            return layer.msg(parme, icon || 0, 16)
                        } else {
                            return $.layer({
                                time: parme,
                                loading: {
                                    type: icon
                                },
                                bgcolor: icon ? "#fff" : "",
                                shade: icon ? [0.1, "#000"] : [0],
                                border: (icon === 3 || !icon) ? [0] : [6, 0.3, "#000"],
                                type: 3,
                                title: ["", false],
                                closeBtn: [0, false]
                            })
                        }
                    },
                    tips: function(html, follow, parme, maxWidth, guide, style) {
                        var conf = {
                            type: 4,
                            shade: false,
                            success: function(layero) {
                                if (!this.closeBtn) {
                                    layero.find(".xubox_tips").css({
                                        "padding-right": 10
                                    })
                                }
                            },
                            bgcolor: "",
                            tips: {
                                msg: html,
                                follow: follow
                            }
                        };
                        conf.time = typeof parme === "object" ? parme.time : (parme | 0);
                        parme = parme || {};
                        conf.closeBtn = parme.closeBtn || false;
                        conf.maxWidth = parme.maxWidth || maxWidth;
                        conf.tips.guide = parme.guide || guide;
                        conf.tips.style = parme.style || style;
                        conf.tips.more = parme.more;
                        return $.layer(conf)
                    }
                };
                var doms = ["xubox_layer", "xubox_iframe", ".xubox_title", ".xubox_text", ".xubox_page", ".xubox_main"];
                var Class = function(setings) {
                    var that = this,
                        config = that.config;
                    layer.index++;
                    that.index = layer.index;
                    that.config = $.extend({}, config, setings);
                    that.config.dialog = $.extend({}, config.dialog, setings.dialog);
                    that.config.page = $.extend({}, config.page, setings.page);
                    that.config.iframe = $.extend({}, config.iframe, setings.iframe);
                    that.config.loading = $.extend({}, config.loading, setings.loading);
                    that.config.tips = $.extend({}, config.tips, setings.tips);
                    that.creat()
                };
                Class.pt = Class.prototype;
                Class.pt.config = {
                    type: 0,
                    shade: [0.3, "#000"],
                    fix: true,
                    move: ".xubox_title",
                    title: "温馨提示",
                    offset: ["", "50%"],
                    area: ["310px", "auto"],
                    closeBtn: [2, true],
                    time: 0,
                    bgcolor: "#fff",
                    border: [2, 0.3, "#999"],
                    zIndex: 7777,
                    maxWidth: 400,
                    dialog: {
                        btns: 1,
                        btn: ["&#x786E;&#x5B9A;", "&#x53D6;&#x6D88;"],
                        type: 8,
                        msg: "",
                        yes: function(index) {
                            layer.close(index)
                        },
                        no: function(index) {
                            layer.close(index)
                        }
                    },
                    page: {
                        dom: "#xulayer",
                        html: "",
                        url: ""
                    },
                    iframe: {
                        src: "http://www.huhoo.com",
                        scrolling: "auto"
                    },
                    loading: {
                        type: 0
                    },
                    tips: {
                        msg: "",
                        follow: "",
                        guide: 0,
                        isGuide: true,
                        style: ["background-color:#FF9900; color:#fff;", "#FF9900"]
                    },
                    success: function(layer) {},
                    close: function(index) {
                        layer.close(index)
                    },
                    end: function() {}
                };
                Class.pt.space = function(html) {
                    var that = this,
                        html = html || "",
                        times = that.index,
                        config = that.config,
                        dialog = config.dialog,
                        ico = dialog.type === -1 ? "" : '<span class="xubox_msg xulayer_png32 xubox_msgico xubox_msgtype' + dialog.type + '"></span>',
                        frame = ['<div class="xubox_dialog">' + ico + '<span class="xubox_msg xubox_text" style="' + (ico ? "" : "padding-left:20px") + '">' + dialog.msg + "</span></div>", '<div class="xubox_page">' + html + "</div>", '<iframe scrolling="' + config.iframe.scrolling + '" allowtransparency="true" id="' + doms[1] + "" + times + '" name="' + doms[1] + "" + times + '" onload="this.className=\'' + doms[1] + '\'" class="' + doms[1] + '" frameborder="0" src="' + config.iframe.src + '"></iframe>', '<span class="xubox_loading xubox_loading_' + config.loading.type + '"></span>', '<div class="xubox_tips" style="' + config.tips.style[0] + '"><div class="xubox_tipsMsg">' + config.tips.msg + '</div><i class="layerTipsG"></i></div>'],
                        shade = "",
                        border = "",
                        zIndex = config.zIndex + times,
                        shadeStyle = "z-index:" + zIndex + "; background-color:" + config.shade[1] + "; opacity:" + config.shade[0] + "; filter:alpha(opacity=" + config.shade[0] * 100 + ");";
                    config.shade[0] && (shade = '<div times="' + times + '" id="xubox_shade' + times + '" class="xubox_shade" style="' + shadeStyle + '"></div>');
                    config.zIndex = zIndex;
                    var title = "",
                        closebtn = "",
                        borderStyle = "z-index:" + (zIndex - 1) + ";  background-color: " + config.border[2] + "; opacity:" + config.border[1] + "; filter:alpha(opacity=" + config.border[1] * 100 + "); top:-" + config.border[0] + "px; left:-" + config.border[0] + "px;";
                    config.border[0] && (border = '<div id="xubox_border' + times + '" class="xubox_border" style="' + borderStyle + '"></div>');
                    if (config.maxmin && (config.type === 1 || config.type === 2) && (!/^\d+%$/.test(config.area[0]) || !/^\d+%$/.test(config.area[1]))) {
                        closebtn = '<a class="xubox_min" href="javascript:;"><cite></cite></a><a class="xubox_max xulayer_png32" href="javascript:;"></a>'
                    }
                    config.closeBtn[1] && (closebtn += '<a class="xubox_close xulayer_png32 xubox_close' + config.closeBtn[0] + '" href="javascript:;" style="' + (config.type === 4 ? "position:absolute; right:-3px; _right:7px; top:-4px;" : "") + '"></a>');
                    var titype = typeof config.title === "object";
                    config.title && (title = '<div class="xubox_title" style="' + (titype ? config.title[1] : "") + '"><em>' + (titype ? config.title[0] : config.title) + "</em></div>");
                    return [shade, '<div times="' + times + '" showtime="' + config.time + '" style="z-index:' + zIndex + '" id="' + doms[0] + "" + times + '" class="' + doms[0] + '">' + '<div style="background-color:' + config.bgcolor + "; z-index:" + zIndex + '" class="xubox_main">' + frame[config.type] + title + '<span class="xubox_setwin">' + closebtn + "</span>" + '<span class="xubox_botton"></span>' + "</div>" + border + "</div>"]
                };
                Class.pt.creat = function() {
                    var that = this,
                        space = "",
                        config = that.config,
                        dialog = config.dialog,
                        times = that.index;
                    var page = config.page,
                        body = $("body"),
                        setSpace = function(html) {
                            var html = html || "";
                            space = that.space(html);
                            body.append($(space[0]))
                        };
                    switch (config.type) {
                        case 0:
                            config.title || (config.area = ["auto", "auto"]);
                            $(".xubox_dialog")[0] && layer.close($(".xubox_dialog").parents("." + doms[0]).attr("times"));
                            break;
                        case 1:
                            if (page.html !== "") {
                                setSpace('<div class="xuboxPageHtml">' + page.html + "</div>");
                                body.append($(space[1]))
                            } else {
                                if (page.url !== "") {
                                    setSpace('<div class="xuboxPageHtml" id="xuboxPageHtml' + times + '">' + page.html + "</div>");
                                    body.append($(space[1]));
                                    $.get(page.url, function(datas) {
                                        $("#xuboxPageHtml" + times).html(datas.toString());
                                        page.ok && page.ok(datas)
                                    })
                                } else {
                                    if ($(page.dom).parents(doms[4]).length == 0) {
                                        setSpace();
                                        $(page.dom).show().wrap($(space[1]))
                                    } else {
                                        return
                                    }
                                }
                            }
                            break;
                        case 3:
                            config.title = false;
                            config.area = ["auto", "auto"];
                            config.closeBtn = ["", false];
                            $(".xubox_loading")[0] && layer.closeLoad();
                            break;
                        case 4:
                            config.title = false;
                            config.area = ["auto", "auto"];
                            config.fix = false;
                            config.border = [0];
                            config.tips.more || layer.closeTips();
                            break
                    }
                    if (config.type !== 1) {
                        setSpace();
                        body.append($(space[1]))
                    }
                    var layerE = that.layerE = $("#" + doms[0] + times);
                    layerE.css({
                        width: config.area[0],
                        height: config.area[1]
                    });
                    config.fix || layerE.css({
                        position: "absolute"
                    });
                    if (config.title && (config.type !== 3 || config.type !== 4)) {
                        var confbtn = config.type === 0 ? dialog : config,
                            layerBtn = layerE.find(".xubox_botton");
                        confbtn.btn = config.btn || dialog.btn;
                        switch (confbtn.btns) {
                            case 0:
                                layerBtn.html("").hide();
                                break;
                            case 1:
                                layerBtn.html('<a href="javascript:;" class="xubox_yes xubox_botton1">' + confbtn.btn[0] + "</a>");
                                break;
                            case 2:
                                layerBtn.html('<a href="javascript:;" class="xubox_yes xubox_botton2">' + confbtn.btn[0] + "</a>" + '<a href="javascript:;" class="xubox_no xubox_botton3">' + confbtn.btn[1] + "</a>");
                                break
                        }
                    }
                    if (layerE.css("left") === "auto") {
                        layerE.hide();
                        setTimeout(function() {
                            layerE.show();
                            that.set(times)
                        }, 500)
                    } else {
                        that.set(times)
                    }
                    config.time <= 0 || that.autoclose();
                    that.callback()
                };
                ready.fade = function(obj, time, opa) {
                    obj.css({
                        opacity: 0
                    }).animate({
                        opacity: opa
                    }, time)
                };
                Class.pt.offset = function() {
                    var that = this,
                        config = that.config,
                        layerE = that.layerE,
                        laywid = layerE.outerHeight(),
                        isInFrame = false;
                    try {
                        if (window.frameElement != null && window.frameElement.scrolling == "no") {
                            isInFrame = true
                        }
                    } catch (e) {}
                    if (isInFrame) {
                        var windowHeight = $(window.top).height();
                        var scrollTop = $(window.top).scrollTop();
                        var headHeight = window.top.headHeight();
                        var _offsetTop = (windowHeight - laywid) / 2 + scrollTop - headHeight;
                        that.offsetTop = (_offsetTop > 0) ? _offsetTop : 0
                    } else {
                        if (config.offset[0] === "" && laywid < win.height()) {
                            that.offsetTop = (win.height() - laywid - 2 * config.border[0]) / 2
                        } else {
                            if (config.offset[0].indexOf("px") != -1) {
                                that.offsetTop = parseFloat(config.offset[0])
                            } else {
                                that.offsetTop = parseFloat(config.offset[0] || 0) / 100 * win.height()
                            }
                        }
                    }
                    that.offsetTop = that.offsetTop + config.border[0] + (config.fix ? 0 : win.scrollTop());
                    if (config.offset[1].indexOf("px") != -1) {
                        that.offsetLeft = parseFloat(config.offset[1]) + config.border[0]
                    } else {
                        config.offset[1] = config.offset[1] === "" ? "50%" : config.offset[1];
                        if (config.offset[1] === "50%") {
                            that.offsetLeft = config.offset[1]
                        } else {
                            that.offsetLeft = parseFloat(config.offset[1]) / 100 * win.width() + config.border[0]
                        }
                    }
                };
                Class.pt.set = function(times) {
                    var that = this;
                    var config = that.config;
                    var dialog = config.dialog;
                    var page = config.page;
                    var loading = config.loading;
                    var layerE = that.layerE;
                    var layerTitle = layerE.find(doms[2]);
                    that.autoArea(times);
                    if (config.title) {
                        if (config.type === 0) {
                            layer.ie6 && layerTitle.css({
                                width: layerE.outerWidth()
                            })
                        }
                    } else {
                        config.type !== 4 && layerE.find(".xubox_close").addClass("xubox_close1")
                    }
                    layerE.attr({
                        "type": ready.type[config.type]
                    });
                    that.offset();
                    if (config.type !== 4) {
                        if (config.shift && !layer.ie6) {
                            if (typeof config.shift === "object") {
                                that.shift(config.shift[0], config.shift[1] || 500, config.shift[2])
                            } else {
                                that.shift(config.shift, 500)
                            }
                        } else {
                            layerE.css({
                                top: that.offsetTop,
                                left: that.offsetLeft
                            })
                        }
                    }
                    switch (config.type) {
                        case 0:
                            layerE.find(doms[5]).css({
                                "background-color": "#fff"
                            });
                            if (config.title) {
                                layerE.find(doms[3]).css({
                                    paddingTop: 18 + layerTitle.outerHeight()
                                })
                            } else {
                                layerE.find(".xubox_msgico").css({
                                    top: 8
                                });
                                layerE.find(doms[3]).css({
                                    marginTop: 11
                                })
                            }
                            break;
                        case 1:
                            layerE.find(page.dom).addClass("layer_pageContent");
                            config.shade[0] && layerE.css({
                                zIndex: config.zIndex + 1
                            });
                            config.title && layerE.find(doms[4]).css({
                                top: layerTitle.outerHeight()
                            });
                            break;
                        case 2:
                            var iframe = layerE.find("." + doms[1]),
                                heg = layerE.height();
                            iframe.addClass("xubox_load").css({
                                width: layerE.width()
                            });
                            config.title ? iframe.css({
                                top: layerTitle.height(),
                                height: heg - layerTitle.height()
                            }) : iframe.css({
                                top: 0,
                                height: heg
                            });
                            layer.ie6 && iframe.attr("src", config.iframe.src);
                            break;
                        case 4:
                            var layArea = [0, layerE.outerHeight()],
                                fow = $(config.tips.follow),
                                fowo = {
                                    width: fow.outerWidth(),
                                    height: fow.outerHeight(),
                                    top: fow.offset().top,
                                    left: fow.offset().left
                                },
                                tipsG = layerE.find(".layerTipsG");
                            config.tips.isGuide || tipsG.remove();
                            layerE.outerWidth() > config.maxWidth && layerE.width(config.maxWidth);
                            fowo.tipColor = config.tips.style[1];
                            layArea[0] = layerE.outerWidth();
                            fowo.autoLeft = function() {
                                if (fowo.left + layArea[0] - win.width() > 0) {
                                    fowo.tipLeft = fowo.left + fowo.width - layArea[0];
                                    tipsG.css({
                                        right: 12,
                                        left: "auto"
                                    })
                                } else {
                                    fowo.tipLeft = fowo.left
                                }
                            };
                            fowo.where = [function() {
                                fowo.autoLeft();
                                fowo.tipTop = fowo.top - layArea[1] - 10;
                                tipsG.removeClass("layerTipsB").addClass("layerTipsT").css({
                                    "border-right-color": fowo.tipColor
                                })
                            }, function() {
                                fowo.tipLeft = fowo.left + fowo.width + 10;
                                fowo.tipTop = fowo.top;
                                tipsG.removeClass("layerTipsL").addClass("layerTipsR").css({
                                    "border-bottom-color": fowo.tipColor
                                })
                            }, function() {
                                fowo.autoLeft();
                                fowo.tipTop = fowo.top + fowo.height + 10;
                                tipsG.removeClass("layerTipsT").addClass("layerTipsB").css({
                                    "border-right-color": fowo.tipColor
                                })
                            }, function() {
                                fowo.tipLeft = fowo.left - layArea[0] + 10;
                                fowo.tipTop = fowo.top;
                                tipsG.removeClass("layerTipsR").addClass("layerTipsL").css({
                                    "border-bottom-color": fowo.tipColor
                                })
                            }];
                            fowo.where[config.tips.guide]();
                            if (config.tips.guide === 0) {
                                fowo.top - (win.scrollTop() + layArea[1] + 8 * 2) < 0 && fowo.where[2]()
                            } else {
                                if (config.tips.guide === 1) {
                                    win.width() - (fowo.left + fowo.width + layArea[0] + 8 * 2) > 0 || fowo.where[3]()
                                } else {
                                    if (config.tips.guide === 2) {
                                        (fowo.top - win.scrollTop() + fowo.height + layArea[1] + 8 * 2) - win.height() > 0 && fowo.where[0]()
                                    } else {
                                        if (config.tips.guide === 3) {
                                            layArea[0] + 8 * 2 - fowo.left > 0 && fowo.where[1]()
                                        } else {
                                            if (config.tips.guide === 4) {}
                                        }
                                    }
                                }
                            }
                            layerE.css({
                                left: fowo.tipLeft,
                                top: fowo.tipTop
                            });
                            break
                    }
                    if (config.fadeIn) {
                        ready.fade(layerE, config.fadeIn, 1);
                        ready.fade($("#xubox_shade" + times), config.fadeIn, config.shade[0])
                    }
                    if (config.fix && config.offset[0] === "" && !config.shift) {
                        win.on("resize", function() {
                            layerE.css({
                                top: (win.height() - layerE.outerHeight()) / 2
                            })
                        })
                    }
                    that.move()
                };
                Class.pt.shift = function(type, rate, stop) {
                    var that = this,
                        config = that.config;
                    var layerE = that.layerE;
                    var cutWth = 0,
                        ww = win.width();
                    var wh = win.height() + (config.fix ? 0 : win.scrollTop());
                    if (config.offset[1] == "50%" || config.offset[1] == "") {
                        cutWth = layerE.outerWidth() / 2
                    } else {
                        cutWth = layerE.outerWidth()
                    }
                    var anim = {
                        t: {
                            top: that.offsetTop
                        },
                        b: {
                            top: wh - layerE.outerHeight() - config.border[0]
                        },
                        cl: cutWth + config.border[0],
                        ct: -layerE.outerHeight(),
                        cr: ww - cutWth - config.border[0]
                    };
                    switch (type) {
                        case "left-top":
                            layerE.css({
                                left: anim.cl,
                                top: anim.ct
                            }).animate(anim.t, rate);
                            break;
                        case "top":
                            layerE.css({
                                top: anim.ct
                            }).animate(anim.t, rate);
                            break;
                        case "right-top":
                            layerE.css({
                                left: anim.cr,
                                top: anim.ct
                            }).animate(anim.t, rate);
                            break;
                        case "right-bottom":
                            layerE.css({
                                left: anim.cr,
                                top: wh
                            }).animate(stop ? anim.t : anim.b, rate);
                            break;
                        case "bottom":
                            layerE.css({
                                top: wh
                            }).animate(stop ? anim.t : anim.b, rate);
                            break;
                        case "left-bottom":
                            layerE.css({
                                left: anim.cl,
                                top: wh
                            }).animate(stop ? anim.t : anim.b, rate);
                            break;
                        case "left":
                            layerE.css({
                                left: -layerE.outerWidth()
                            }).animate({
                                left: that.offsetLeft
                            }, rate);
                            break
                    }
                };
                Class.pt.autoArea = function(times) {
                    var that = this,
                        times = times || that.index,
                        config = that.config,
                        page = config.page;
                    var layerE = $("#" + doms[0] + times),
                        layerTitle = layerE.find(doms[2]),
                        layerMian = layerE.find(doms[5]);
                    var titHeight = config.title ? layerTitle.innerHeight() : 0,
                        outHeight, btnHeight = 0;
                    if (config.area[0] === "auto" && layerMian.outerWidth() >= config.maxWidth) {
                        layerE.css({
                            width: config.maxWidth
                        })
                    }
                    switch (config.type) {
                        case 0:
                            var aBtn = layerE.find(".xubox_botton>a");
                            outHeight = layerE.find(doms[3]).outerHeight() + 20;
                            if (aBtn.length > 0) {
                                btnHeight = aBtn.outerHeight() + 20
                            }
                            break;
                        case 1:
                            var layerPage = layerE.find(doms[4]);
                            outHeight = $(page.dom).outerHeight();
                            config.area[0] === "auto" && layerE.css({
                                width: layerPage.outerWidth()
                            });
                            if (page.html !== "" || page.url !== "") {
                                outHeight = layerPage.outerHeight()
                            }
                            break;
                        case 2:
                            layerE.find("iframe").css({
                                width: layerE.outerWidth(),
                                height: layerE.outerHeight() - (config.title ? layerTitle.innerHeight() : 0)
                            });
                            break;
                        case 3:
                            var load = layerE.find(".xubox_loading");
                            outHeight = load.outerHeight();
                            layerMian.css({
                                width: load.width()
                            });
                            break
                    }(config.area[1] === "auto") && layerMian.css({
                        height: titHeight + outHeight + btnHeight
                    });
                    $("#xubox_border" + times).css({
                        width: layerE.outerWidth() + 2 * config.border[0],
                        height: layerE.outerHeight() + 2 * config.border[0]
                    });
                    (layer.ie6 && config.area[0] !== "auto") && layerMian.css({
                        width: layerE.outerWidth()
                    });
                    (config.offset[1] === "50%" || config.offset[1] == "") && (config.type !== 4) ? layerE.css({
                        marginLeft: -layerE.outerWidth() / 2
                    }): layerE.css({
                        marginLeft: 0
                    })
                };
                Class.pt.move = function() {
                    var that = this,
                        config = that.config,
                        conf = {
                            setY: 0,
                            moveLayer: function() {
                                if (parseInt(conf.layerE.css("margin-left")) == 0) {
                                    var lefts = parseInt(conf.move.css("left"))
                                } else {
                                    var lefts = parseInt(conf.move.css("left")) + (-parseInt(conf.layerE.css("margin-left")))
                                }
                                if (conf.layerE.css("position") !== "fixed") {
                                    lefts = lefts - conf.layerE.parent().offset().left;
                                    conf.setY = 0
                                }
                                conf.layerE.css({
                                    left: lefts,
                                    top: parseInt(conf.move.css("top")) - conf.setY
                                })
                            }
                        };
                    var movedom = that.layerE.find(config.move);
                    config.move && movedom.attr("move", "ok");
                    config.move ? movedom.css({
                        cursor: "move"
                    }) : movedom.css({
                        cursor: "auto"
                    });
                    $(config.move).on("mousedown", function(M) {
                        M.preventDefault();
                        if ($(this).attr("move") === "ok") {
                            conf.ismove = true;
                            conf.layerE = $(this).parents("." + doms[0]);
                            var xx = conf.layerE.offset().left,
                                yy = conf.layerE.offset().top,
                                ww = conf.layerE.width() - 6,
                                hh = conf.layerE.height() - 6;
                            if (!$("#xubox_moves")[0]) {
                                $("body").append('<div id="xubox_moves" class="xubox_moves" style="left:' + xx + "px; top:" + yy + "px; width:" + ww + "px; height:" + hh + 'px; z-index:2147483584"></div>')
                            }
                            conf.move = $("#xubox_moves");
                            config.moveType && conf.move.css({
                                opacity: 0
                            });
                            conf.moveX = M.pageX - conf.move.position().left;
                            conf.moveY = M.pageY - conf.move.position().top;
                            conf.layerE.css("position") !== "fixed" || (conf.setY = win.scrollTop())
                        }
                    });
                    $(document).mousemove(function(M) {
                        if (conf.ismove) {
                            var offsetX = M.pageX - conf.moveX,
                                offsetY = M.pageY - conf.moveY;
                            M.preventDefault();
                            if (!config.moveOut) {
                                conf.setY = win.scrollTop();
                                var setRig = win.width() - conf.move.outerWidth() - config.border[0],
                                    setTop = config.border[0] + conf.setY;
                                offsetX < config.border[0] && (offsetX = config.border[0]);
                                offsetX > setRig && (offsetX = setRig);
                                offsetY < setTop && (offsetY = setTop);
                                offsetY > win.height() - conf.move.outerHeight() - config.border[0] + conf.setY && (offsetY = win.height() - conf.move.outerHeight() - config.border[0] + conf.setY)
                            }
                            conf.move.css({
                                left: offsetX,
                                top: offsetY
                            });
                            config.moveType && conf.moveLayer();
                            offsetX = null;
                            offsetY = null;
                            setRig = null;
                            setTop = null
                        }
                    }).mouseup(function() {
                        try {
                            if (conf.ismove) {
                                conf.moveLayer();
                                conf.move.remove()
                            }
                            conf.ismove = false
                        } catch (e) {
                            conf.ismove = false
                        }
                        config.moveEnd && config.moveEnd()
                    })
                };
                Class.pt.autoclose = function() {
                    var that = this,
                        time = that.config.time,
                        maxLoad = function() {
                            time--;
                            if (time === 0) {
                                layer.close(that.index);
                                clearInterval(that.autotime)
                            }
                        };
                    that.autotime = setInterval(maxLoad, 1000)
                };
                ready.config = {
                    end: {}
                };
                Class.pt.callback = function() {
                    var that = this,
                        layerE = that.layerE,
                        config = that.config,
                        dialog = config.dialog;
                    that.openLayer();
                    that.config.success(layerE);
                    layer.ie6 && that.IE6(layerE);
                    layerE.find("input,textarea").first().focus();
                    layerE.find(".xubox_close").on("click", function() {
                        config.close(that.index);
                        layer.close(that.index)
                    });
                    layerE.find(".xubox_yes").on("click", function() {
                        config.yes ? config.yes(that.index) : dialog.yes(that.index)
                    });
                    layerE.find(".xubox_no").on("click", function() {
                        config.no ? config.no(that.index) : dialog.no(that.index);
                        layer.close(that.index)
                    });
                    if (that.config.shadeClose) {
                        $("#xubox_shade" + that.index).on("click", function() {
                            layer.close(that.index)
                        })
                    }
                    layerE.find(".xubox_min").on("click", function() {
                        layer.min(that.index, config);
                        config.min && config.min(layerE)
                    });
                    layerE.find(".xubox_max").on("click", function() {
                        if ($(this).hasClass("xubox_maxmin")) {
                            layer.restore(that.index);
                            config.restore && config.restore(layerE)
                        } else {
                            layer.full(that.index, config);
                            config.full && config.full(layerE)
                        }
                    });
                    ready.config.end[that.index] = config.end
                };
                ready.reselect = function() {
                    $.each($("select"), function(index, value) {
                        var sthis = $(this);
                        if (!sthis.parents("." + doms[0])[0]) {
                            (sthis.attr("layer") == 1 && $("." + doms[0]).length < 1) && sthis.removeAttr("layer").show()
                        }
                        sthis = null
                    })
                };
                Class.pt.IE6 = function(layerE) {
                    var that = this;
                    var _ieTop = layerE.offset().top;
                    if (that.config.fix) {
                        var ie6Fix = function() {
                            layerE.css({
                                top: win.scrollTop() + _ieTop
                            })
                        }
                    } else {
                        var ie6Fix = function() {
                            layerE.css({
                                top: _ieTop
                            })
                        }
                    }
                    ie6Fix();
                    win.scroll(ie6Fix);
                    $.each($("select"), function(index, value) {
                        var sthis = $(this);
                        if (!sthis.parents("." + doms[0])[0]) {
                            sthis.css("display") == "none" || sthis.attr({
                                "layer": "1"
                            }).hide()
                        }
                        sthis = null
                    })
                };
                Class.pt.openLayer = function() {
                    var that = this,
                        layerE = that.layerE;
                    layer.autoArea = function(index) {
                        return that.autoArea(index)
                    };
                    layer.shift = function(type, rate, stop) {
                        that.shift(type, rate, stop)
                    };
                    layer.setMove = function() {
                        return that.move()
                    };
                    layer.zIndex = that.config.zIndex;
                    layer.setTop = function(layerNow) {
                        var setZindex = function() {
                            layer.zIndex++;
                            layerNow.css("z-index", layer.zIndex + 1)
                        };
                        layer.zIndex = parseInt(layerNow[0].style.zIndex);
                        layerNow.on("mousedown", setZindex);
                        return layer.zIndex
                    }
                };
                ready.isauto = function(layero, options, offset) {
                    options.area[0] === "auto" && (options.area[0] = layero.outerWidth());
                    options.area[1] === "auto" && (options.area[1] = layero.outerHeight());
                    layero.attr({
                        area: options.area + "," + offset
                    });
                    layero.find(".xubox_max").addClass("xubox_maxmin")
                };
                ready.rescollbar = function(index) {
                    if (doms.html.attr("layer-full") == index) {
                        if (doms.html[0].style.removeProperty) {
                            doms.html[0].style.removeProperty("overflow")
                        } else {
                            doms.html[0].style.removeAttribute("overflow")
                        }
                        doms.html.removeAttr("layer-full")
                    }
                };
                layer.getIndex = function(selector) {
                    return $(selector).parents("." + doms[0]).attr("times")
                };
                layer.getChildFrame = function(selector, index) {
                    index = index || $("." + doms[1]).parents("." + doms[0]).attr("times");
                    return $("#" + doms[0] + index).find("." + doms[1]).contents().find(selector)
                };
                layer.getFrameIndex = function(name) {
                    return $(name ? "#" + name : "." + doms[1]).parents("." + doms[0]).attr("times")
                };
                layer.iframeAuto = function(index) {
                    index = index || $("." + doms[1]).parents("." + doms[0]).attr("times");
                    var heg = layer.getChildFrame("body", index).outerHeight(),
                        layero = $("#" + doms[0] + index),
                        tit = layero.find(doms[2]),
                        titHt = 0;
                    tit && (titHt = tit.height());
                    layero.css({
                        height: heg + titHt
                    });
                    var bs = -parseInt($("#xubox_border" + index).css("top"));
                    $("#xubox_border" + index).css({
                        height: heg + 2 * bs + titHt
                    });
                    $("#" + doms[1] + index).css({
                        height: heg
                    })
                };
                layer.iframeSrc = function(index, url) {
                    $("#" + doms[0] + index).find("iframe").attr("src", url)
                };
                layer.area = function(index, options) {
                    var layero = [$("#" + doms[0] + index), $("#xubox_border" + index)],
                        type = layero[0].attr("type"),
                        main = layero[0].find(doms[5]),
                        title = layero[0].find(doms[2]);
                    if (type === ready.type[1] || type === ready.type[2]) {
                        layero[0].css(options);
                        main.css({
                            width: options.width,
                            height: options.height
                        });
                        if (type === ready.type[2]) {
                            var iframe = layero[0].find("iframe");
                            iframe.css({
                                width: options.width,
                                height: title ? options.height - title.innerHeight() : options.height
                            })
                        }
                        if (layero[0].css("margin-left") !== "0px") {
                            options.hasOwnProperty("top") && layero[0].css({
                                top: options.top - (layero[1][0] ? parseFloat(layero[1].css("top")) : 0)
                            });
                            options.hasOwnProperty("left") && layero[0].css({
                                left: options.left + layero[0].outerWidth() / 2 - (layero[1][0] ? parseFloat(layero[1].css("left")) : 0)
                            });
                            layero[0].css({
                                marginLeft: -layero[0].outerWidth() / 2
                            })
                        }
                        if (layero[1][0]) {
                            layero[1].css({
                                width: parseFloat(options.width) - 2 * parseFloat(layero[1].css("left")),
                                height: parseFloat(options.height) - 2 * parseFloat(layero[1].css("top"))
                            })
                        }
                    }
                };
                layer.min = function(index, options) {
                    var layero = $("#" + doms[0] + index),
                        offset = [layero.position().top, layero.position().left + parseFloat(layero.css("margin-left"))];
                    ready.isauto(layero, options, offset);
                    layer.area(index, {
                        width: 180,
                        height: 35
                    });
                    layero.find(".xubox_min").hide();
                    layero.attr("type") === "page" && layero.find(doms[4]).hide();
                    ready.rescollbar(index)
                };
                layer.restore = function(index) {
                    var layero = $("#" + doms[0] + index),
                        area = layero.attr("area").split(",");
                    var type = layero.attr("type");
                    layer.area(index, {
                        width: parseFloat(area[0]),
                        height: parseFloat(area[1]),
                        top: parseFloat(area[2]),
                        left: parseFloat(area[3])
                    });
                    layero.find(".xubox_max").removeClass("xubox_maxmin");
                    layero.find(".xubox_min").show();
                    layero.attr("type") === "page" && layero.find(doms[4]).show();
                    ready.rescollbar(index)
                };
                layer.full = function(index, options) {
                    var layero = $("#" + doms[0] + index),
                        borders = options.border[0] * 2 || 6,
                        timer;
                    var offset = [layero.position().top, layero.position().left + parseFloat(layero.css("margin-left"))];
                    ready.isauto(layero, options, offset);
                    if (!doms.html.attr("layer-full")) {
                        doms.html.css("overflow", "hidden").attr("layer-full", index)
                    }
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        layer.area(index, {
                            top: layero.css("position") === "fixed" ? 0 : win.scrollTop(),
                            left: layero.css("position") === "fixed" ? 0 : win.scrollLeft(),
                            width: win.width() - borders,
                            height: win.height() - borders
                        })
                    }, 100)
                };
                layer.title = function(name, index) {
                    var title = $("#" + doms[0] + (index || layer.index)).find(".xubox_title>em");
                    title.html(name)
                };
                layer.close = function(index) {
                    var layero = $("#" + doms[0] + index),
                        type = layero.attr("type"),
                        shadeNow = $("#xubox_moves, #xubox_shade" + index);
                    if (!layero[0]) {
                        return
                    }
                    if (type == ready.type[1]) {
                        if (layero.find(".xuboxPageHtml")[0]) {
                            layero[0].innerHTML = "";
                            layero.remove()
                        } else {
                            layero.find(".xubox_setwin,.xubox_close,.xubox_botton,.xubox_title,.xubox_border").remove();
                            for (var i = 0; i < 3; i++) {
                                layero.find(".layer_pageContent").unwrap().hide()
                            }
                        }
                    } else {
                        layero[0].innerHTML = "";
                        layero.remove()
                    }
                    shadeNow.remove();
                    layer.ie6 && ready.reselect();
                    ready.rescollbar(index);
                    typeof ready.config.end[index] === "function" && ready.config.end[index]();
                    delete ready.config.end[index]
                };
                layer.closeLoad = function() {
                    layer.close($(".xubox_loading").parents("." + doms[0]).attr("times"))
                };
                layer.closeTips = function() {
                    layer.closeAll("tips")
                };
                layer.closeAll = function(type) {
                    $.each($("." + doms[0]), function() {
                        var othis = $(this);
                        var is = type ? (othis.attr("type") === type) : 1;
                        if (is) {
                            layer.close(othis.attr("times"))
                        }
                        is = null
                    })
                };
                layer.prompt = function(parme, yes, no) {
                    var log = {},
                        parme = parme || {},
                        conf = {
                            area: ["auto", "auto"],
                            offset: [parme.top || "", ""],
                            title: parme.title || "&#x4FE1;&#x606F;",
                            dialog: {
                                btns: 2,
                                type: -1,
                                msg: '<input type="' + function() {
                                    if (parme.type === 1) {
                                        return "password"
                                    } else {
                                        if (parme.type === 2) {
                                            return "file"
                                        } else {
                                            return "text"
                                        }
                                    }
                                }() + '" class="xubox_prompt xubox_form" id="xubox_prompt" value="' + (parme.val || "") + '" />',
                                yes: function(index) {
                                    var val = log.prompt.val();
                                    if (val === "") {
                                        log.prompt.focus()
                                    } else {
                                        if (val.replace(/\s/g, "").length > (parme.length || 1000)) {
                                            layer.tips("&#x6700;&#x591A;&#x8F93;&#x5165;" + (parme.length || 1000) + "&#x4E2A;&#x5B57;&#x6570;", "#xubox_prompt", 2)
                                        } else {
                                            yes && yes(val, index, log.prompt)
                                        }
                                    }
                                },
                                no: no
                            },
                            success: function() {
                                log.prompt = $("#xubox_prompt");
                                log.prompt.focus()
                            }
                        };
                    if (parme.type === 3) {
                        conf.dialog.msg = '<textarea class="xubox_prompt xubox_form xubox_formArea" id="xubox_prompt">' + (parme.val || "") + "</textarea>"
                    }
                    return $.layer(conf)
                };
                layer.tab = function(parme) {
                    var log = {},
                        parme = parme || {},
                        data = parme.data || [],
                        conf = {
                            type: 1,
                            border: [0],
                            area: ["auto", "auto"],
                            bgcolor: "",
                            title: false,
                            shade: parme.shade,
                            offset: parme.offset,
                            move: ".xubox_tabmove",
                            closeBtn: false,
                            page: {
                                html: '<div class="xubox_tab" style="' + function() {
                                    parme.area = parme.area || [];
                                    return "width:" + (parme.area[0] || "500px") + "; height:" + (parme.area[1] || "300px") + '">'
                                }() + '<span class="xubox_tabmove"></span>' + '<div class="xubox_tabtit">' + function() {
                                    var len = data.length,
                                        ii = 1,
                                        str = "";
                                    if (len > 0) {
                                        str = '<span class="xubox_tabnow">' + data[0].title + "</span>";
                                        for (; ii < len; ii++) {
                                            str += "<span>" + data[ii].title + "</span>"
                                        }
                                    }
                                    return str
                                }() + "</div>" + '<ul class="xubox_tab_main">' + function() {
                                    var len = data.length,
                                        ii = 1,
                                        str = "";
                                    if (len > 0) {
                                        str = '<li class="xubox_tabli xubox_tab_layer">' + (data[0].content || "no content") + "</li>";
                                        for (; ii < len; ii++) {
                                            str += '<li class="xubox_tabli">' + (data[ii].content || "no  content") + "</li>"
                                        }
                                    }
                                    return str
                                }() + "</ul>" + '<span class="xubox_tabclose" title="&#x5173;&#x95ED;">X</span>' + "</div>"
                            },
                            success: function(layerE) {
                                var btn = $(".xubox_tabtit").children(),
                                    main = $(".xubox_tab_main").children(),
                                    close = $(".xubox_tabclose");
                                btn.on("click", function() {
                                    var othis = $(this),
                                        index = othis.index();
                                    othis.addClass("xubox_tabnow").siblings().removeClass("xubox_tabnow");
                                    main.eq(index).show().siblings().hide()
                                });
                                close.on("click", function() {
                                    layer.close(layerE.attr("times"))
                                })
                            }
                        };
                    return $.layer(conf)
                };
                layer.photos = function(options) {
                    options = options || {};
                    var log = {
                            imgIndex: 1,
                            end: null,
                            html: $("html")
                        },
                        win = $(window),
                        json = options.json,
                        page = options.page;
                    if (json) {
                        var data = json.data;
                        if (json.status === 1) {
                            log.imgLen = data.length;
                            if (data.length > 0) {
                                log.thissrc = data[json.start].src;
                                log.pid = data[json.start].pid;
                                log.imgsname = (json.title || "");
                                log.name = data[json.start].name;
                                log.imgIndex = json.start + 1
                            } else {
                                layer.msg("&#x6CA1;&#x6709;&#x4EFB;&#x4F55;&#x56FE;&#x7247;", 2, 8);
                                return
                            }
                        } else {
                            layer.msg("&#x672A;&#x8BF7;&#x6C42;&#x5230;&#x6570;&#x636E;", 2, 8);
                            return
                        }
                    } else {
                        if (page.disabled && page.disabled == true) {
                            var imgs = page.imgs;
                            var nowimg = imgs[page.start];
                            log.thissrc = nowimg.url;
                            log.pid = nowimg.pid;
                            log.imgsname = page.title;
                            log.name = nowimg.name;
                            log.imgIndex = page.start + 1;
                            log.imgLen = imgs.length
                        } else {
                            var imgs = page.parent.find("img"),
                                nowimg = imgs.eq(page.start);
                            log.thissrc = (nowimg.attr("layer-img") || nowimg.attr("src"));
                            log.pid = nowimg.attr("pid");
                            log.imgLen = imgs.length;
                            log.imgsname = (page.title || "");
                            log.name = nowimg.attr("alt");
                            log.imgIndex = page.start + 1;
                            log.imgs = imgs;
                        }
                    }
                    var conf = {
                        type: 1,
                        border: [0],
                        area: [(options.html ? 915 : 600) + "px", "auto"],
                        title: false,
                        shade: [0.9, "#000", true],
                        shadeClose: true,
                        closeBtn: [0, true],
                        offset: ["25px", ""],
                        bgcolor: "",
                        page: {
                            html: '<div class="xubox_bigimg"><img src="' + log.thissrc + '" alt="' + (log.name || "") + '" layer-pid="' + (log.pid || "") + '"><div class="xubox_imgsee">' + function() {
                                if (log.imgLen > 1) {
                                    return '<a href="" class="xubox_iconext xubox_prev"></a><a href="" class="xubox_iconext xubox_next"></a>'
                                } else {
                                    return ""
                                }
                            }() + '<div class="xubox_imgbar"><span class="xubox_imgtit"><a class="a_img" href="javascript:;">' + log.name + " </a><em>" + log.imgIndex + "/" + log.imgLen + "</em></span></div></div></div>" + function() {
                                if (options.html) {
                                    return '<div class="xubox_intro">' + options.html + "</div>"
                                } else {
                                    return ""
                                }
                            }()
                        },
                        success: function(layero) {
                            log.bigimg = layero.find(".xubox_bigimg");
                            log.imgsee = log.bigimg.find(".xubox_imgsee");
                            log.imgbar = log.imgsee.find(".xubox_imgbar");
                            log.imgtit = log.imgbar.find(".xubox_imgtit");
                            log.layero = layero;
                            var img = log.imgs = log.bigimg.find("img");
                            clearTimeout(log.timerr);
                            log.timerr = setTimeout(function() {
                                $("html").css("overflow", "hidden").attr("layer-full", log.index)
                            }, 10);
                            img.load(function() {
                                log.imgarea = [img.outerWidth(), img.outerHeight()];
                                log.resize(layero)
                            });
                            log.event()
                        },
                        end: function() {
                            var index = layer.load();
                            layer.close(index);
                            log.end = true
                        }
                    };
                    log.event = function() {
                        log.bigimg.hover(function() {
                            log.imgsee.show()
                        }, function() {
                            log.imgsee.hide()
                        });
                        conf.imgprev = function() {
                            log.imgIndex--;
                            if (log.imgIndex < 1) {
                                log.imgIndex = log.imgLen
                            }
                            log.tabimg()
                        };
                        log.bigimg.find(".xubox_prev").on("click", function(event) {
                            event.preventDefault();
                            conf.imgprev()
                        });
                        conf.imgnext = function() {
                            log.imgIndex++;
                            if (log.imgIndex > log.imgLen) {
                                log.imgIndex = 1
                            }
                            log.tabimg()
                        };
                        log.bigimg.find(".xubox_next").on("click", function(event) {
                            event.preventDefault();
                            conf.imgnext()
                        });
                        $(document).keyup(function(event) {
                            if (!log.end) {
                                var code = event.keyCode;
                                event.preventDefault();
                                if (code === 37) {
                                    conf.imgprev()
                                } else {
                                    if (code === 39) {
                                        conf.imgnext()
                                    } else {
                                        if (code === 27) {
                                            layer.close(log.index)
                                        }
                                    }
                                }
                            }
                        });
                        log.tabimg = function() {
                            var timer, src, pid, name;
                            log.imgs.removeAttr("style");
                            if (json) {
                                var nowdata = data[log.imgIndex - 1];
                                src = nowdata.src;
                                pid = nowdata.pid;
                                name = nowdata.name
                            } else {
                                if (options.page.disabled) {
                                    var thisimg = imgs[log.imgIndex - 1];
                                    src = thisimg.imgUrl;
                                    pid = thisimg.pid || "";
                                    name = thisimg.imgName || ""
                                } else {
                                    var thisimg = imgs.eq(log.imgIndex - 1);
                                    src = thisimg.attr("layer-img") || thisimg.attr("src");
                                    pid = thisimg.attr("layer-pid") || "";
                                    name = thisimg.attr("alt") || ""
                                }
                            }
                            log.imgs.attr({
                                src: src,
                                "layer-pid": pid,
                                alt: name
                            });
                            log.imgtit.find("em").text(log.imgIndex + "/" + log.imgLen);
                            log.imgtit.find(".a_img").text(name);
                            log.imgsee.show();
                            options.tab && options.tab({
                                pid: pid,
                                name: name
                            })
                        }
                    };
                    log.resize = function(layero) {
                        var relog = {},
                            wa = [win.width(), win.height()];
                        relog.limit = wa[0] - wa[0] / wa[1] * (60 * wa[0] / wa[1]);
                        if (relog.limit < 600) {
                            relog.limit = 600
                        }
                        var area = [relog.limit, wa[1] > 400 ? wa[1] - 50 : 400];
                        area[0] = options.html ? area[0] : (area[0] - 300);
                        layer.area(log.index, {
                            width: area[0] + (options.html ? 15 : 0),
                            height: area[1]
                        });
                        relog.flwidth = area[0] - (options.html ? 300 : 0);
                        if (log.imgarea[0] > relog.flwidth) {
                            log.imgs.css({
                                maxWidth: relog.flwidth,
                                maxHeight: area[1]
                            })
                        } else {
                            log.imgs.css({
                                maxWidth: log.imgarea[0],
                                maxHeight: area[1]
                            })
                        }
                        if (log.imgs.outerHeight() < area[1]) {
                            log.imgs.css({
                                top: (area[1] - log.imgs.outerHeight()) / 2
                            })
                        }
                        log.imgs.css({
                            visibility: "visible"
                        });
                        log.bigimg.css({
                            width: relog.flwidth,
                            height: area[1],
                            "background-color": options.bgcolor
                        });
                        if (options.html) {
                            layero.find(".xubox_intro").css({
                                height: area[1]
                            })
                        }
                        relog = null;
                        wa = null;
                        area = null
                    };
                    win.on("resize", function() {
                        if (log.end) {
                            return
                        }
                        if (log.timer) {
                            clearTimeout(log.timer)
                        }
                        log.timer = setTimeout(function() {
                            log.resize(log.layero)
                        }, 200)
                    });
                    log.index = $.layer(conf);
                    return log.index
                };
                layer.photosPage = function(options) {
                    var log = {};
                    log.run = function(index) {
                        layer.photos({
                            html: options.html,
                            success: options.success,
                            page: {
                                title: options.title,
                                id: options.id,
                                start: index,
                                parent: options.parent
                            }
                        })
                    };
                    options = options || {};
                    $(options.parent).find("img").each(function(index) {
                        $(this).on("click", function() {
                            log.run(index)
                        })
                    })
                };
                ready.run = function() {
                    $ = jQuery;
                    win = $(window);
                    doms.html = $("html");
                    $.layer = function(deliver) {
                        var o = new Class(deliver);
                        return o.index
                    }
                };
                ready.run()
            }(window);
        })(jQuery);
    };
});
