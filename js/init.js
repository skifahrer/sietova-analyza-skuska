let alg;
let options = {
    layout: {
        randomSeed: 2,
    },
    edges: {
        color: {color: "blue"},
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
            alg = new Algoritmus();
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
            alg = new Algoritmus();
        });
    });

    $("#graphinput").bind('input propertychange', function () {
        alg.replot();
    });
})(jQuery);


/** tato trieda ti zjednosui zivot pri algorimtoch */

class Algoritmus {
    /** inicizalizuje co treba, aby vykreslovalo a fungovali grafove metody */
    constructor() {
        this.dot = $("#graphinput").val();
        this.graph = new graphlibDot.read(this.dot);
        this.vis = new vis.Network(document.getElementById('canvas'), {}, options);
        this.logger = new Logger(this);
        this.plot();
    }

    /** vrati hodnotu hrany */
    label(edge) {
        return this.graph.edge(edge).label;
    }

    /** vrati zoznam hran aj s ich hodnotami */
    edges_with_values() {
        let self = this; // save object reference

        return _.map(this.graph.edges(), function (edge) {
            return {'v': edge.v, 'w': edge.w, 'value': {'label': self.label(edge)}}
        });
    }

    /** vrati usporiadani zoznam hran od najmensieho */
    edges_sorted(sort) {
        if (sort === undefined) {
            sort = 'asc'
        }
        let edges = this.edges_with_values();
        let sorted = _.orderBy(edges, function (e) {
            return e.value.label
        }, [sort]);
        return sorted;
    }

    /** TOTO SU UZ TECHNICKE METODY, NECHAJ ICH TAK */

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

    /** loguje kroky a ukazuje ich na interfacy **/
    log(text, object, draw) {
        this.logger.log(text, object, draw);
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

    log(text, object, draw) {
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
            this._draw(canvas, object);
        }

        this.step++;
    }

    _draw(canvas, object) {
        var visn = new vis.Network(canvas, {}, options);
        var dataset = vis.parseDOTNetwork(this.alg.dot);
        visn.setData(dataset);
        this._highlight(visn, dataset, object);
    }

    _highlight(visn, dataset, object) {
        var edges = [];
        if (this._get_object_type(object) === 'EDG') {
            edges = this._get_edges_from_object(dataset, object);
            this._highlight_edges(visn, dataset, edges, '#ff383f');
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

