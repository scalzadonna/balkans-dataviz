d3.csv('https://gist.githubusercontent.com/scalzadonna/62b30e39cc42b40c94c238d32e8644c3/raw/8d529ef0c268d3a747b05486314bba18844c9896/balkan-activities.csv', function (d) {
    return {
        activityId: d.riactivityId,
        activityType: d.riactivityTypeName,
        domain: d.domainName,
        area: d.interventionAreaName,
        year: +d.year,
        date: d.date
    };
}).then(function (activitiesData) {
    const brush = vl.selectInterval().encodings('x');

    const plot1 = vl.markBar()
        .encode(
            vl.color().fieldN('activityType').legend(null),
            vl.x().fieldO('year'),
            vl.y().count('activityId').type('quantitative'),
        )
        .select(brush)
        .height(300)
        .width(700);

    const plot2 = vl.markBar()
        .encode(
            vl.color().fieldN('domain').legend(null),
            vl.x().count('activityId').type('quantitative'),
            vl.y().fieldN('domain'),
            vl.order().fieldN('domain').sort('descending')
        )
        .transform(vl.filter(brush))
        .height(200)
        .width(700);

    const plots = vl.vconcat(plot1, plot2).data(activitiesData);

    vegaEmbed('#viz2', plots.toJSON());
});
