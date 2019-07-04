var width = 500;
var height = 500;
var svg = d3.select("svg");
svg.attr("x", 300)
    .attr("y", 300)
    .attr("width", 800)
    .attr("height", 600);

/*初始化force*/
var force = d3.layout.force()
    .nodes(nodes)
    .links(edges)
    .size([650, 550])     //作用力的中心区域       
    .linkDistance(100)   //连线的长度
    .charge([-65]);     //负数为排斥 正数为吸引

/*很关键 启动force*/
force.start();

/*添加连线*/
var svg_edges = svg.selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("dx", function (d, i) {
        return i * 20;
    })
    .attr("dy", function (d, i) {
        return i * 30;
    })
    .style("stroke", "#ccc")  //线条的颜色
    .style("stroke-width", 1);//线条的宽度

/*颜色*/
var color = d3.scale.category20();

/*添加节点*/
var svg_nodes = svg.selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("cx", function (d, i) {
        return i * 20;
    })
    .attr("cy", function (d, i) {
        return i * 30;
    })
    .attr("r", 5)
    .style("fill", function (d, i) {
        return color(i);
    })
    .call(force.drag);//控制拖动


//单击结点显示电影信息
var svg_node = svg.selectAll("circle")
    .on("click", function (d, i) {
        document.getElementById("movie-infohint").style.display="none";
        document.getElementById("movie-info").style.visibility = "visible";
        document.getElementById("papername").innerHTML = nodes[i].name;
        document.getElementById("author").innerHTML = nodes[i].author;
        document.getElementById("year").innerHTML = nodes[i].year;
        document.getElementById("conference").innerHTML = nodes[i].conference;
        document.getElementById("link").innerHTML = nodes[i].link;
        document.getElementById("abstract").innerHTML = nodes[i].abstract;
        document.getElementById("keywords").innerHTML = nodes[i].keywords;
    })

/*添加描述节点的文字*/
/*
var svg_texts = svg.selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "good")
    .style("fill", "black")
    .attr("dx", -10)               //文字相对node中心的移动
    .attr("dy", 10)
    .text(function (d, i) {         //返回节点的名字
        return d.name;
    })
    .style("fill", "white");
*/

force.on("tick", function () { //对于每一个时间间隔  将之前通过force活着
    //更新连线坐标
    svg_edges.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    //更新节点坐标
    svg_nodes.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });

});

//中心度算法展示 结点缩放
function displayCentrality(i) {
    restoreCentrality();
    restoreTree();
    if (i == 1) {                //介数中心度
        svg.selectAll("circle")
            .data(nodes)
            .transition()
            .duration(2000)
            .attr("r", function (circle) {
                return ((circle.betweeness /200));
            });
    }
    else if (i == 2) {                //紧密中心度
        svg.selectAll("circle")
            .data(nodes)
            .transition()
            .duration(2000)
            .attr("r", function (circle) {
                return ((60-4*circle.closeness)/6);
            });
    }
}

//社区发现算法展示 颜色归类
function displayCommunity() {
    restoreCentrality();
    restoreTree();
    svg.selectAll("circle")
        .data(nodes)
        .transition()
        .duration(2000)
        .style("fill", function (circle) {
            return color(20-circle.group);
        })
}

function restoreCommunity() {
    restoreCentrality();
    restoreTree();
    svg.selectAll("circle")
        .data(nodes)
        .transition()
        .duration(2000)
        .style("fill", function (d,i) {
            return color(i);
        })
}


function restoreCentrality() {
    svg.selectAll("circle")
        .data(nodes)
        .transition()
        .attr("r", 5);
}


/*
var tree = [{ source: 0, target: 10 }, { source: 1, target: 10 }];
var treestate = 0;
svg.selectAll("line")
    .data(tree)
    .style("stroke", "#000")  //线条的颜色
    .style("stroke-width", 3);//线条的宽度
var svg_edges2 = svg.selectAll("line")
    .data(tree)
    .enter()
    .append("line")
    .attr("dx", function (d, i) {
        return i * 20;
    })
    .attr("dy", function (d, i) {
        return i * 30;
    })
    .style("stroke", "#000")  //线条的颜色
    .style("stroke-width", 1.7);//线条的宽度
    */

function buildTree() {         //prim算法展示
    restoreCentrality();
    restoreTree();
    svg_edges
        .transition()
        .duration(1000)
        .style("stroke", function (line) {
            if (line.isTree == 1) {
                return "#000";
            }
            else
                return "#ccc";
        })  //线条的颜色
        .style("stroke-width", function (line) {
            if (line.isTree == 1)
                return 2;
            else
                return 1;
        });//线条的宽度
}

function restoreTree() {         //清空
    svg_edges.style("stroke", "#ccc")
        .style("stroke-width", 1);
}


function showRoute(i) {
    var cur = 0;
    var nex = shortestroute[i][0];
    var n = shortestroute[i].length;
    for (var k = 0; k < n; k++) {
        nodes[shortestroute[i][k]].visited = 1;
    }
    svg_nodes.transition()
        .duration(1000)
        .attr("r", function (circle) {
            if (circle.visited == 1) {
                return 15;
            }
            else
                return 5;
        });
    svg_edges.transition()
        .duration(1000)
        .style("stroke", function (line) {
            if (line.source.visited == 1 && line.target.visited == 1)
                return "#000";
            else
                return "#ccc";
        })
        .style("stroke-width", function (line) {
            if (line.source.visited == 1 && line.target.visited == 1)
                return 5;
            else
                return 1;
        });
    /*
    for (var k = 0; k < shortestroute[i].length - 1; k++) {
        cur = nex;
        nex = shortestroute[i][k + 1];
        svg_nodes.transition()
            .duration(1000)
            .attr("r", function (circle) {
                if (circle.number == cur || circle.visited == 1) {
                    circle.visited = 1;
                    return 15;
                }
                else
                    return 5;
            });
        svg_edges.transition()
            .duration(600)
            .style("stroke", function (line) {
                if ((line.source.number == cur && line.target.number == nex) || (line.source.number == nex && line.target.number == cur))
                    return "#000";
                if (line.source.visited == 1 && line.target.visited == 1)
                    return "#000";
                else
                    return "#ccc";
            })
            .style("stroke-width", function (line) {
                if ((line.source.number == cur && line.target.number == nex) || (line.source.number == nex && line.target.number == cur))
                    return 5;
                if (line.source.visited == 1 && line.target.visited == 1)
                    return 5;
                else
                    return 1;
            });
    }
    svg_nodes.transition()
        .duration(1000)
        .attr("r", function (circle) {
            if (circle.number == nex || circle.visited == 1) {
                circle.visited = 1;
                return 15;
            }
            else
                return 5;
        });
        */
}

var shortestroute2 = new Array;
shortestroute2[0] = [1, 2];
shortestroute2[1] = [0, 1];

function getRoute() {  //最短路径展示
    clearRoute();
    restoreCentrality();
    restoreTree();
    var ps = document.getElementById("startpoint").value;
    //alert(ps);
    var es = document.getElementById("endpoint").value;
    var s = -1;
    var e = -1;
    var n = nodes.length;
    for (var i = 0; i < n; i++) {
        if (ps == nodes[i].name) {
            s = i;
            break;
        }
    }
    for (var i = 0; i < n; i++) {
        if (es == nodes[i].name) {
            e = i;
            break;
        }
    }
    if (s < e) {
        var temp = s;
        s = e;
        e = temp;
    }
    if (s >= 0 && e >= 0) {
        var ans = s * n + e;
        showRoute(ans);
        console.log(shortestroute[ans]);
    }
    else
        alert("您搜索的电影不存在");
    console.log(s+" "+e);
        
}

function clearRoute() {
    svg_edges
        .style("stroke", "#ccc")
        .style("stroke-width", 1);
    svg_nodes
        .attr("r", function (circle) {
            circle.visited = 0;
            return 5;
        });
}

var img = document.getElementById('img');
function show() {
    if (img.style.display == 'none') {
        img.style.display = '';
    } else {
        img.style.display = 'none';
    }
}

function change_pic() {
    var imgObj = document.getElementById("first_pic");
    if (imgObj.getAttribute("src", 12) == "img/BestG.jpg") {
        imgObj.src = "img/BestG0.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG0.jpg") {
        imgObj.src = "img/BestG1.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG1.jpg") {
        imgObj.src = "img/BestG2.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG2.jpg") {
        imgObj.src = "img/BestG3.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG3.jpg") {
        imgObj.src = "img/BestG4.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG4.jpg") {
        imgObj.src = "img/BestG5.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG5.jpg") {
        imgObj.src = "img/BestG6.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG6.jpg") {
        imgObj.src = "img/BestG7.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG7.jpg") {
        imgObj.src = "img/BestG8.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG8.jpg") {
        imgObj.src = "img/BestG9.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG9.jpg") {
        imgObj.src = "img/BestG10.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG10.jpg") {
        imgObj.src = "img/BestG11.jpg";
    } else if (imgObj.getAttribute("src", 13) == "img/BestG11.jpg") {
        imgObj.src = "img/BestG.jpg";
    } 
}