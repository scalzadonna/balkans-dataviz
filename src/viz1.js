//DATA:
//https://gist.githubusercontent.com/scalzadonna/62b30e39cc42b40c94c238d32e8644c3/raw/8d529ef0c268d3a747b05486314bba18844c9896/balkan-activities.csv
//https://gist.githubusercontent.com/scalzadonna/62b30e39cc42b40c94c238d32e8644c3/raw/8d529ef0c268d3a747b05486314bba18844c9896/balkan-participations.csv	

const minCollabs = 3;
const width = 640;
const height = 640;
d3.csv("https://gist.githubusercontent.com/scalzadonna/62b30e39cc42b40c94c238d32e8644c3/raw/8d529ef0c268d3a747b05486314bba18844c9896/balkan-participations.csv", function (d) {
    return {
        activityId: d.riactivityId,
        activityType: d.riactivityType,
        country: d.countryName,
        participant: d.affiliationName,

    };
})
    .then(function (participantsData) {
        activitiesById = _.groupBy(participantsData, 'activityId');
        collabs = _.filter(activitiesById, function (parts) { return parts.length >= minCollabs });
        results = extractRelationships(collabs);
        console.log(color);
        let graph = draw(results[1], results[0], color, drag);
        document.getElementById("viz1").appendChild(graph);
        console.log('drawed');
    });

const extractRelationships = function (collabsGroup) {
    let participantsArray = [];
    let participantsJson = [];
    let linksJson = [];
    collabsGroup.forEach((c) => {
        var group = _.clone(c);

        while (group.length > 0) {
            var p1 = group.shift();

            participantsArray.push({
                'id': p1.participant,
                'group': p1.country
            });

            group.forEach(
                (p2) => {
                    linksJson.push({
                        'source': p1.participant,
                        'target': p2.participant,
                        'value': p1.activityId
                    })
                });
        }
    });
    //count participants, excluding repeated
    participantsJson = _.reduce(participantsArray, (result, participant) => {
        let ix = result.findIndex(p => p.id === participant.id);
        if (ix < 0) {
            //participant is not in the array yet
            result.push({ ...participant, count: 1 });
        } else {
            result[ix].count++;
        }
        return result;
    }, []);

    return [participantsJson, linksJson];

}
const simulation = function () {

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
};


const draw = function (linksJson, participantsJson, color, drag) {

    const links = linksJson.map(d => Object.create(d));
    const nodes = participantsJson.map(d => Object.create(d));
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX().strength(0.05))
        .force("y", d3.forceY().strength(0.08));

    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    const link = svg.append("g")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", (d) => 3 + d.count)
        .attr("fill", color)
        .call(drag(simulation));

    node.append("title")
        .text(d => d.id);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });


    return svg.node();
}

const color = function () {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return d => scale(d.group);
};

const drag = function () {

    return (
        simulation => {

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    )

}

