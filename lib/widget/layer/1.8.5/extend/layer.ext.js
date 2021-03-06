/*! layer弹层拓展类 */ ;
define("widget/layer/1.8.5/extend/layer.ext", [], function(require, exports, module) {
    return function(jquery) {
        layer.use("skin/layer.ext.css", function() {
            layer.ext && layer.ext()
        }), layer.prompt = function(a, b, c) {
            var d = {},
                a = a || {},
                e = {
                    area: ["auto", "auto"],
                    offset: [a.top || "", ""],
                    title: a.title || "&#x4FE1;&#x606F;",
                    dialog: {
                        btns: 2,
                        type: -1,
                        msg: '<input type="' + function() {
                            return 1 === a.type ? "password" : 2 === a.type ? "file" : "text"
                        }() + '" class="xubox_prompt xubox_form" id="xubox_prompt" value="' + (a.val || "") + '" />',
                        yes: function(c) {
                            var e = d.prompt.val();
                            "" === e ? d.prompt.focus() : e.replace(/\s/g, "").length > (a.length || 1e3) ? layer.tips("&#x6700;&#x591A;&#x8F93;&#x5165;" + (a.length || 1e3) + "&#x4E2A;&#x5B57;&#x6570;", "#xubox_prompt", 2) : b && b(e, c, d.prompt)
                        },
                        no: c
                    },
                    success: function() {
                        d.prompt = $("#xubox_prompt"), d.prompt.focus()
                    }
                };
            return 3 === a.type && (e.dialog.msg = '<textarea class="xubox_prompt xubox_form xubox_formArea" id="xubox_prompt">' + (a.val || "") + "</textarea>"), $.layer(e)
        }, layer.tab = function(a) {
            var a = a || {},
                b = a.data || [],
                c = {
                    type: 1,
                    border: [0],
                    area: ["auto", "auto"],
                    bgcolor: "",
                    title: !1,
                    shade: a.shade,
                    offset: a.offset,
                    move: ".xubox_tabmove",
                    closeBtn: !1,
                    page: {
                        html: '<div class="xubox_tab" style="' + function() {
                            return a.area = a.area || [], "width:" + (a.area[0] || "500px") + "; height:" + (a.area[1] || "300px") + '">'
                        }() + '<span class="xubox_tabmove"></span><div class="xubox_tabtit">' + function() {
                            var a = b.length,
                                c = 1,
                                d = "";
                            if (a > 0)
                                for (d = '<span class="xubox_tabnow">' + b[0].title + "</span>"; a > c; c++) d += "<span>" + b[c].title + "</span>";
                            return d
                        }() + '</div><ul class="xubox_tab_main">' + function() {
                            var a = b.length,
                                c = 1,
                                d = "";
                            if (a > 0)
                                for (d = '<li class="xubox_tabli xubox_tab_layer">' + (b[0].content || "no content") + "</li>"; a > c; c++) d += '<li class="xubox_tabli">' + (b[c].content || "no  content") + "</li>";
                            return d
                        }() + '</ul><span class="xubox_tabclose" title="&#x5173;&#x95ED;">X</span></div>'
                    },
                    success: function(a) {
                        var b = $(".xubox_tabtit").children(),
                            c = $(".xubox_tab_main").children(),
                            d = $(".xubox_tabclose");
                        b.on("click", function() {
                            var a = $(this),
                                b = a.index();
                            a.addClass("xubox_tabnow").siblings().removeClass("xubox_tabnow"), c.eq(b).show().siblings().hide()
                        }), d.on("click", function() {
                            layer.close(a.attr("times"))
                        })
                    }
                };
            return $.layer(c)
        }, layer.photos = function(a) {
            a = a || {};
            var b = {
                    imgIndex: 1,
                    end: null,
                    html: $("html")
                },
                c = $(window),
                d = a.json,
                e = a.page;
            if (d) {
                var f = d.data;
                if (1 !== d.status) return void layer.msg("&#x672A;&#x8BF7;&#x6C42;&#x5230;&#x6570;&#x636E;", 2, 8);
                if (b.imgLen = f.length, !(f.length > 0)) return void layer.msg("&#x6CA1;&#x6709;&#x4EFB;&#x4F55;&#x56FE;&#x7247;", 2, 8);
                b.thissrc = f[d.start].src, b.pid = f[d.start].pid, b.imgsname = d.title || "", b.name = f[d.start].name, b.imgIndex = d.start + 1
            } else {
                var g = $(e.parent).find("img"),
                    h = g.eq(e.start);
                b.thissrc = h.attr("layer-img") || h.attr("src"), b.pid = h.attr("pid"), b.imgLen = g.length, b.imgsname = e.title || "", b.name = h.attr("alt"), b.imgIndex = e.start + 1
            }
            var i = {
                type: 1,
                border: [0],
                area: [(a.html ? 915 : 600) + "px", "auto"],
                title: !1,
                shade: [.9, "#000", !0],
                shadeClose: !0,
                offset: ["25px", ""],
                bgcolor: "",
                page: {
                    html: '<div class="xubox_bigimg"><img src="' + b.thissrc + '" alt="' + (b.name || "") + '" layer-pid="' + (b.pid || "") + '"><div class="xubox_imgsee">' + function() {
                        return b.imgLen > 1 ? '<a href="" class="xubox_iconext xubox_prev"></a><a href="" class="xubox_iconext xubox_next"></a>' : ""
                    }() + '<div class="xubox_imgbar"><span class="xubox_imgtit"><a href="javascript:;">' + b.imgsname + " </a><em>" + b.imgIndex + "/" + b.imgLen + "</em></span></div></div></div>" + function() {
                        return a.html ? '<div class="xubox_intro">' + a.html + "</div>" : ""
                    }()
                },
                success: function(a) {
                    b.bigimg = a.find(".xubox_bigimg"), b.imgsee = b.bigimg.find(".xubox_imgsee"), b.imgbar = b.imgsee.find(".xubox_imgbar"), b.imgtit = b.imgbar.find(".xubox_imgtit"), b.layero = a;
                    var c = b.imgs = b.bigimg.find("img");
                    clearTimeout(b.timerr), b.timerr = setTimeout(function() {
                        $("html").css("overflow", "hidden").attr("layer-full", b.index)
                    }, 10), c.load(function() {
                        b.imgarea = [c.outerWidth(), c.outerHeight()], b.resize(a)
                    }), b.event()
                },
                end: function() {
                    layer.closeAll(), b.end = !0
                }
            };
            return b.event = function() {
                b.bigimg.hover(function() {
                    b.imgsee.show()
                }, function() {
                    b.imgsee.hide()
                }), i.imgprev = function() {
                    b.imgIndex--, b.imgIndex < 1 && (b.imgIndex = b.imgLen), b.tabimg()
                }, b.bigimg.find(".xubox_prev").on("click", function(a) {
                    a.preventDefault(), i.imgprev()
                }), i.imgnext = function() {
                    b.imgIndex++, b.imgIndex > b.imgLen && (b.imgIndex = 1), b.tabimg()
                }, b.bigimg.find(".xubox_next").on("click", function(a) {
                    a.preventDefault(), i.imgnext()
                }), $(document).keyup(function(a) {
                    if (!b.end) {
                        var c = a.keyCode;
                        a.preventDefault(), 37 === c ? i.imgprev() : 39 === c ? i.imgnext() : 27 === c && layer.close(b.index)
                    }
                }), b.tabimg = function() {
                    var c, e, h;
                    if (b.imgs.removeAttr("style"), d) {
                        var i = f[b.imgIndex - 1];
                        c = i.src, e = i.pid, h = i.name
                    } else {
                        var j = g.eq(b.imgIndex - 1);
                        c = j.attr("layer-img") || j.attr("src"), e = j.attr("layer-pid") || "", h = j.attr("alt") || ""
                    }
                    b.imgs.attr({
                        src: c,
                        "layer-pid": e,
                        alt: h
                    }), b.imgtit.find("em").text(b.imgIndex + "/" + b.imgLen), b.imgsee.show(), a.tab && a.tab({
                        pid: e,
                        name: h
                    })
                }
            }, b.resize = function(d) {
                var e = {},
                    f = [c.width(), c.height()];
                e.limit = f[0] - f[0] / f[1] * (60 * f[0] / f[1]), e.limit < 600 && (e.limit = 600);
                var g = [e.limit, f[1] > 400 ? f[1] - 50 : 400];
                g[0] = a.html ? g[0] : g[0] - 300, layer.area(b.index, {
                    width: g[0] + (a.html ? 15 : 0),
                    height: g[1]
                }), e.flwidth = g[0] - (a.html ? 300 : 0), b.imgs.css(b.imgarea[0] > e.flwidth ? {
                    width: e.flwidth
                } : {
                    width: b.imgarea[0]
                }), b.imgs.outerHeight() < g[1] && b.imgs.css({
                    top: (g[1] - b.imgs.outerHeight()) / 2
                }), b.imgs.css({
                    visibility: "visible"
                }), b.bigimg.css({
                    width: e.flwidth,
                    height: g[1],
                    "background-color": a.bgcolor
                }), a.html && d.find(".xubox_intro").css({
                    height: g[1]
                }), e = null, f = null, g = null
            }, c.on("resize", function() {
                b.end || (b.timer && clearTimeout(b.timer), b.timer = setTimeout(function() {
                    b.resize(b.layero)
                }, 200))
            }), b.index = $.layer(i), b.index
        }, layer.photosPage = function(a) {
            var b = {};
            b.run = function(b) {
                layer.photos({
                    html: a.html,
                    success: a.success,
                    page: {
                        title: a.title,
                        id: a.id,
                        start: b,
                        parent: a.parent
                    }
                })
            }, a = a || {}, $(a.parent).find("img").each(function(a) {
                $(this).on("click", function() {
                    b.run(a)
                })
            })
        };
    };
});
