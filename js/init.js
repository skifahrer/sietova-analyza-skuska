let plot;
let options = {
    layout: {
        randomSeed: 2,
    },
    edges: {
        color: {color: "#444444"},
        smooth: {
            enabled: true,
            type: "dynamic",
            roundness: 0.1
        },
        width: 1,
        arrowStrikethrough: true,
        arrows: {
            to: {
                enabled: false,
                scaleFactor: 0.3,
            }
        }
    },
    nodes: {
        color: 'grey'
    }
};

(function ($) {
    $(function () {

        $("#neorientovany").click(function () {
            $("#graphinput").val('graph { A; B; C; D; E; ' + '\n' +
                'A -- B [label="6"];' + '\n' +
                'B -- D [label="4"];' + '\n' +
                'D -- E [label="6"];' + '\n' +
                'A -- E [label="4"];' + '\n' +
                'C -- A [label="9"];' + '\n' +
                'C -- B [label="7"];' + '\n' +
                'C -- D [label="6"];' + '\n' +
                'C -- E [label="6"];' + '\n' +
                'splines=false;' +
                '}');
            M.textareaAutoResize($('#graphinput'));
            plot = new Plot();
        });

        $("#orientovany").click(function () {
            $("#graphinput").val('digraph { A; B; C; D; E; ' + '\n' +
                'A -> B [label="4"];' + '\n' +
                'B -> A [label="3"];' + '\n' +

                'B -> D [label="5"];' + '\n' +
                'D -> B [label="5"];' + '\n' +

                'D -> E [label="6"];' + '\n' +
                'E -> D [label="3"];' + '\n' +

                'A -> E [label="4"];' + '\n' +
                'E -> A [label="3"];' + '\n' +

                'C -> A [label="9"];' + '\n' +
                'A -> C [label="9"];' + '\n' +

                'C -> B [label="7"];' + '\n' +
                'B -> C [label="5"];' + '\n' +

                'C -> D [label="6"];' + '\n' +
                'D -> C [label="6"];' + '\n' +

                'C -> E [label="6"];' + '\n' +
                'E -> C [label="4"];' + '\n' +

                'splines=false;' +
                '}');
            M.textareaAutoResize($('#graphinput'));
            plot = new Plot();
        });
    });

    $("#graphinput").bind('input propertychange', function () {
        plot.replot();
    });
})(jQuery);

class Plot {
    constructor() {
        this.dot = $("#graphinput").val();
        this.vis = new vis.Network(document.getElementById('canvas'), {}, options);
        this.plot();
    }

    /** kreslenie grafu */
    plot() {
        let datadot = vis.parseDOTNetwork(this.dot);
        this.vis.setData(datadot);
    }

    /** prekreslovanie */
    replot() {
        this.dot = $("#graphinput").val();
        this.plot();
    }
}


/** tato trieda ti zjednosui zivot pri algorimtoch */

class Algoritmus {
    /** inicizalizuje co treba, aby vykreslovalo a fungovali grafove metody */
    constructor(plot) {
        this.plot = plot;
        this.logger = new Logger(this);
        this.dot = $("#graphinput").val();
        this.graph = new graphlibDot.read(this.dot);
        this.kostra = new graphlib.Graph({directed: this.graph.isDirected()});
    }

    /** vrati hodnotu hrany */
    label(edge) {
        return this.graph.edge(edge).label;
    }

    /** vrati hodnotu hrany */
    value(node) {
        return this.graph.node(node);
    }

    /** vrati zoznam hran aj s ich hodnotami */
    edges() {
        return this.include_label_to_edges(this.graph.edges());
    }

    /**
     * zaciatocny vrchol
     */
    starting_node() {
        let nodes = this.plot.vis.getSelectedNodes();
        let S = this.graph.nodes();
        let node;
        if (nodes.length === 0) {
            node = S[(_.random(0, S.length - 1))];
            this.log('Kedze vrchol nebol oznaceny, tak vyberieme nahodne jeden vrchol, a tym vrcholom je: <b>' + node + '</b>', node, false);
        } else {
            node = nodes[0];
            this.log('Ideme hladat kostru z oznaceneho vrcholu: <b>' + node + '</b>', node, false);
        }
        return node;
    }

    /**
     * nodes matrix
     */
    node_matrix(nodes) {
        const obj_a = {};
        nodes.forEach(function (node) {
            obj_a[node] = -1;   // using the current value as key
        });
        return obj_a;
    }

    /** ak hrany nemaju hodnoty tak im ju prida */
    include_label_to_edges(edges) {
        let self = this; // save object reference

        return _.map(edges, function (edge) {
            return {'v': edge.v, 'w': edge.w, 'value': {'label': self.label(edge)}}
        });
    }

    get_outgoing_edges_from_selected_nodes_and_sort(nodes) {
        let edges = [];
        let self = this;
        _.forEach(nodes, function (node) {
            let node_edges = [];
            if (self.graph.isDirected()) {
                node_edges = self.graph.outEdges(node);
            } else {
                node_edges = self.graph.nodeEdges(node);
            }
            edges = _.unionWith(edges, node_edges, _.isEqual)
        });

        return this.sort_edges(this.include_label_to_edges(edges), 'asc');
    }


    /** vrati usporiadani zoznam hran od najmensieho */
    edges_sorted(sort) {
        let edges = this.edges();
        return this.sort_edges(edges, sort);
    }

    sort_edges(edges, sort) {
        if (sort === undefined) {
            sort = 'asc'
        }
        let sorted = _.orderBy(edges, function (e) {
            return e.value.label
        }, [sort]);
        return sorted;
    }

    sort(component_prev) {
        var arr = [];
        _.forEach(component_prev, function (array) {
            arr.push(array.sort());
        });
        return arr;
    }

    sort_assoc(Distances) {
        return _(Distances)
            .toPairs()
            .orderBy([1], ['asc'])
            .fromPairs()
            .value();
    }


    /** TOTO SU UZ TECHNICKE METODY, NECHAJ ICH TAK */

    /** loguje kroky a ukazuje ich na interfacy **/
    log(text, object, draw, color) {
        this.logger.log(text, object, draw, color);
    }

    compute(title) {
        this.logger.init(title);

    }
}

/**
 * ma nastarosti logovanie
 */
class Logger {
    constructor(alg) {
        this.self = this;
        this.output = $("#output");
        this.step = 1;
        this.alg = alg;
    }

    init(title) {
        this.clear();
        this.log_title(title);
    }

    log_title(title) {
        $("#output").prepend('<h2>' + title + '</h2>');
    }

    log(text, object, draw, color) {
        draw = (typeof draw === 'undefined') ? true : draw;

        let step_id = 'step' + this.step;
        let canvas_step_id = 'canvas' + step_id;
        let canvas = '';

        let output = '<div class="row" id=' + step_id + '>\n' +
            '    <div class="col s12">\n' +
            '      <div class="card">\n' +
            '        <div class="card-content">\n' +
            '          <span class="card-title">Krok ' + this.step + '.</span>\n' +
            '          <p>' + text + '</p>\n' +
            '        </div>\n' +
            '        <div class="card-action">\n' +
            '<div class="row">' +
            '<div class="col s12 m4">' +
            '<pre>' + dump(object) + '</pre>' +
            '</div>\n' +
            '<div class="col s12 m8 possible_canvas" >' +
            '</div>\n' +
            '</div>' +
            '        </div>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>';


        $("#output").append(output);

        if (draw) {
            canvas = document.createElement('div');
            canvas.setAttribute("class", "canvas");
            canvas.setAttribute("id", "canvas_step_id");
            $('#output').find("#" + step_id + ' .possible_canvas').append(canvas);
            this._draw(canvas, object, color);
        }

        this.step++;
    }

    _draw(canvas, object, color) {
        var visn = new vis.Network(canvas, {}, options);
        var dataset = vis.parseDOTNetwork(this.alg.dot);
        visn.setData(dataset);
        this._highlight(visn, dataset, object, color);
    }

    _highlight(visn, dataset, object, color) {
        var edges = [];
        if (this._get_object_type(object) === 'EDG') {
            edges = this._get_edges_from_object(dataset, object);
            color = (typeof color === 'undefined') ? '#04c323' : color;
            this._highlight_edges(visn, dataset, edges, color);
        }
    }

    _highlight_edges(visn, dataset, edges, color) {
        let colored_edges = [];
        dataset.edges = _.map(dataset.edges, function (edge) {
            if (_.includes(edges, edge.id)) {
                edge.color = {color: color};
                colored_edges.push(edge.from);
                colored_edges.push(edge.to);
                colored_edges = _.uniq(colored_edges);
            }
            return edge;
        });

        dataset.nodes = _.map(dataset.nodes, function (node) {
            if (_.includes(colored_edges, node.id)) {
                node.color = color;
            }
            return node;
        });

        visn.setData(dataset);
    }

    _get_object_type(object) {
        if (_.every(object, function (o) {
            return _.has(o, 'w')
        })) {
            return 'EDG';
        }
    }

    _get_edges_from_object(dataset, object) {
        let edge_ids = [];
        let self = this.self;
        _.forEach(object, function (value) {
            let edge = self.vis_getEdgeBetweenNodes(dataset, value.v, value.w);
            if ('null' !== edge || [] !== edge) {
                edge_ids.push(edge[0].id);
            }
        });
        return edge_ids;
    }

    vis_getEdgeBetweenNodes(dataset, node1, node2) {
        let self = this;
        return dataset.edges.filter(function (edge) {
            if (self.alg.graph.isDirected()) {
                return (edge.from === node1 && edge.to === node2);
            } else {
                return ((edge.from === node1 && edge.to === node2) || (edge.from === node2 && edge.to === node1));
            }
        });
    };

    clear() {
        $("#output").html('');
    }
}

function dump(v, s) {
    s = s || 1;
    let t = '';
    if (typeof v === "object") {
        t += "\n";
        for (const i in v) {
            t += Array(s).join(" ") + i + ": ";
            t += dump(v[i], s + 3);
        }
    } else {
        t += v + " (" + typeof v + ")\n";
    }
    return t;
}


/**
 * A min-priority queue data structure. This algorithm is derived from Cormen,
 * et al., "Introduction to Algorithms". The basic idea of a min-priority
 * queue is that you can efficiently (in O(1) time) get the smallest key in
 * the queue. Adding and removing elements takes O(log n) time. A key can
 * have its priority decreased in O(log n) time.
 */
function PriorityQueue() {
    this._arr = [];
    this._keyIndices = {};
}

/**
 * Returns the number of elements in the queue. Takes `O(1)` time.
 */
PriorityQueue.prototype.size = function () {
    return this._arr.length;
};

/**
 * Returns the keys that are in the queue. Takes `O(n)` time.
 */
PriorityQueue.prototype.keys = function () {
    return this._arr.map(function (x) {
        return x.key;
    });
};

/**
 * Returns `true` if **key** is in the queue and `false` if not.
 */
PriorityQueue.prototype.has = function (key) {
    return _.has(this._keyIndices, key);
};

/**
 * Returns the priority for **key**. If **key** is not present in the queue
 * then this function returns `undefined`. Takes `O(1)` time.
 *
 * @param {Object} key
 */
PriorityQueue.prototype.priority = function (key) {
    var index = this._keyIndices[key];
    if (index !== undefined) {
        return this._arr[index].priority;
    }
};

/**
 * Returns the key for the minimum element in this queue. If the queue is
 * empty this function throws an Error. Takes `O(1)` time.
 */
PriorityQueue.prototype.min = function () {
    if (this.size() === 0) {
        throw new Error("Queue underflow");
    }
    return this._arr[0].key;
};

/**
 * Inserts a new key into the priority queue. If the key already exists in
 * the queue this function returns `false`; otherwise it will return `true`.
 * Takes `O(n)` time.
 *
 * @param {Object} key the key to add
 * @param {Number} priority the initial priority for the key
 */
PriorityQueue.prototype.add = function (key, priority) {
    var keyIndices = this._keyIndices;
    if (!_.has(keyIndices, key)) {
        var arr = this._arr;
        var index = arr.length;
        keyIndices[key] = index;
        arr.push({key: key, priority: priority});
        this._decrease(index);
        return true;
    }
    return false;
};

/**
 * add composite
 * @param composite
 */
PriorityQueue.prototype.addCompostieWithLabelValues = function (composite) {
    let self = this;
    _.forEach(composite, function (comp) {

        self.add(comp, comp.value.label);
    });
};


/**
 * Removes and returns the smallest key in the queue. Takes `O(log n)` time.
 */
PriorityQueue.prototype.removeMin = function () {
    this._swap(0, this._arr.length - 1);
    var min = this._arr.pop();
    delete this._keyIndices[min.key];
    this._heapify(0);
    return min.key;
};

/**
 * Decreases the priority for **key** to **priority**. If the new priority is
 * greater than the previous priority, this function will throw an Error.
 *
 * @param {Object} key the key for which to raise priority
 * @param {Number} priority the new priority for the key
 */
PriorityQueue.prototype.decrease = function (key, priority) {
    var index = this._keyIndices[key];
    if (priority > this._arr[index].priority) {
        throw new Error("New priority is greater than current priority. " +
            "Key: " + key + " Old: " + this._arr[index].priority + " New: " + priority);
    }
    this._arr[index].priority = priority;
    this._decrease(index);
};

PriorityQueue.prototype._heapify = function (i) {
    var arr = this._arr;
    var l = 2 * i;
    var r = l + 1;
    var largest = i;
    if (l < arr.length) {
        largest = arr[l].priority < arr[largest].priority ? l : largest;
        if (r < arr.length) {
            largest = arr[r].priority < arr[largest].priority ? r : largest;
        }
        if (largest !== i) {
            this._swap(i, largest);
            this._heapify(largest);
        }
    }
};

PriorityQueue.prototype._decrease = function (index) {
    var arr = this._arr;
    var priority = arr[index].priority;
    var parent;
    while (index !== 0) {
        parent = index >> 1;
        if (arr[parent].priority < priority) {
            break;
        }
        this._swap(index, parent);
        index = parent;
    }
};

PriorityQueue.prototype._swap = function (i, j) {
    var arr = this._arr;
    var keyIndices = this._keyIndices;
    var origArrI = arr[i];
    var origArrJ = arr[j];
    arr[i] = origArrJ;
    arr[j] = origArrI;
    keyIndices[origArrJ.key] = i;
    keyIndices[origArrI.key] = j;
};

