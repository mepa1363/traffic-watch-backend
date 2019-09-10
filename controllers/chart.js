const _ = require("lodash");
const db = require("./config");

const getHourlyTrendOverToday = (req, res) => {
  const cameraId = req.params.id;
  // CHART: return sum of count for each object for a day (today) on an hourly basis for a given camera and all cameras
  const query =
    cameraId === "all"
      ? `WITH max_date AS (SELECT max(time::date) AS date FROM count),
            processing AS (SELECT avg(count)::int            AS avg,
                           date_trunc('hour', a.time) as hour,
                           CASE
                               WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                   THEN 'Vehicle'
                               WHEN label = 'bicycle' THEN 'Bike'
                               WHEN label = 'person' THEN 'Pedestrian'
                               END                    AS label
                    FROM count AS a,
                         max_date AS b
                    WHERE a.time::date = b.date
                      AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                    GROUP BY a.label, hour)
        SELECT sum(avg)::int, label, hour
        from processing
        group by label, hour;`
      : `WITH max_date AS (SELECT max(time::date) AS date FROM count WHERE camera_id = ${cameraId}),
            processing AS (SELECT sum(count)::int            AS count,
                           date_trunc('hour', a.time) as hour,
                           CASE
                               WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                   THEN 'Vehicle'
                               WHEN label = 'bicycle' THEN 'Bike'
                               WHEN label = 'person' THEN 'Pedestrian'
                               END                    AS label
                    FROM count AS a,
                         max_date AS b
                    WHERE a.time::date = b.date
                      AND camera_id = ${cameraId}
                      AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                    GROUP BY a.label, hour)
        SELECT sum(count)::int, label, hour
        from processing
        group by label, hour;`;
  db.any(query)
    .then(response => {
      const vehicles = response
        .filter(item => item.label === "Vehicle")
        .map(item => {
          return { x: item.hour, y: parseInt(item.sum) };
        });
      const pedestrians = response
        .filter(item => item.label === "Pedestrian")
        .map(item => {
          return { x: item.hour, y: parseInt(item.sum) };
        });
      const bikes = response
        .filter(item => item.label === "Bike")
        .map(item => {
          return { x: item.hour, y: parseInt(item.sum) };
        });
      res.status(200).json({
        vehicles: _.sortBy(vehicles, "x"),
        pedestrians: _.sortBy(pedestrians, "x"),
        bikes: _.sortBy(bikes, "x")
      });
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

const getDailyTrendOverPastWeek = (req, res) => {
  const cameraId = req.params.id;
  // CHART: return sum of count for each object for a day (today) on an hourly basis for a given camera and all cameras
  const query =
    cameraId === "all"
      ? `WITH max_date AS (SELECT max(time::date) as date from count),
            processing AS (SELECT avg(count)                as avg,
                                date_trunc('day', a.time) AS day,
                                CASE
                                    WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                        THEN 'Vehicle'
                                    WHEN label = 'bicycle' THEN 'Bike'
                                    WHEN label = 'person' THEN 'Pedestrian'
                                    END                   AS label
                            FROM count AS a,
                                max_date AS b
                            WHERE b.date - INTERVAL '1 WEEK' < a.time::date
                            AND a.time::date < b.date
                            AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                            GROUP BY a.label, day)
        SELECT sum(avg)::int, day, label
        FROM processing
        GROUP BY day, label;`
      : `WITH max_date AS (SELECT max(time::date) as date from count WHERE camera_id = ${cameraId}),
            processing AS (SELECT sum(count)                as count,
                                date_trunc('day', a.time) AS day,
                                CASE
                                    WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                        THEN 'Vehicle'
                                    WHEN label = 'bicycle' THEN 'Bike'
                                    WHEN label = 'person' THEN 'Pedestrian'
                                    END                   AS label
                            FROM count AS a,
                                max_date AS b
                            WHERE b.date - INTERVAL '1 WEEK' < a.time::date
                            AND a.time::date < b.date
                            AND camera_id = ${cameraId}
                            AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                            GROUP BY a.label, day)
        SELECT sum(count)::int, day, label
        FROM processing
        GROUP BY day, label;`;
  db.any(query)
    .then(response => {
      const vehicles = response
        .filter(item => item.label === "Vehicle")
        .map(item => {
          return { x: item.day, y: parseInt(item.sum) };
        });
      const pedestrians = response
        .filter(item => item.label === "Pedestrian")
        .map(item => {
          return { x: item.day, y: parseInt(item.sum) };
        });
      const bikes = response
        .filter(item => item.label === "Bike")
        .map(item => {
          return { x: item.day, y: parseInt(item.sum) };
        });
      res.status(200).json({
        vehicles: _.sortBy(vehicles, "x"),
        pedestrians: _.sortBy(pedestrians, "x"),
        bikes: _.sortBy(bikes, "x")
      });
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

const getDailyTrendOverPastMonth = (req, res) => {
  const cameraId = req.params.id;
  // CHART: return sum of count for each object for a day (today) on an hourly basis for a given camera and all cameras
  const query =
    cameraId === "all"
      ? `WITH max_date AS (SELECT max(time::date) as date from count),
              processing AS (SELECT avg(count)                AS avg,
                                    date_trunc('day', a.time) AS day,
                                    CASE
                                        WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                            THEN 'Vehicle'
                                        WHEN label = 'bicycle' THEN 'Bike'
                                        WHEN label = 'person' THEN 'Pedestrian'
                                        END                   AS label
                              FROM count AS a,
                                  max_date AS b
                              WHERE b.date - INTERVAL '1 MONTH' < a.time::date
                                AND a.time::date < b.date
                                AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                              GROUP BY label,day)
            SELECT sum(avg)::int, day, label
            FROM processing
            GROUP BY day, label;`
      : `WITH max_date AS (SELECT max(time::date) as date from count WHERE camera_id = ${cameraId}),
              processing AS (SELECT sum(count)                AS count,
                                    date_trunc('day', a.time) AS day,
                                    CASE
                                        WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                            THEN 'Vehicle'
                                        WHEN label = 'bicycle' THEN 'Bike'
                                        WHEN label = 'person' THEN 'Pedestrian'
                                        END                   AS label
                              FROM count AS a,
                                  max_date AS b
                              WHERE b.date - INTERVAL '1 MONTH' < a.time::date
                                AND a.time::date < b.date
                                AND camera_id = ${cameraId}
                                AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                              GROUP BY label,day)
          SELECT sum(count)::int, day, label
          FROM processing
          GROUP BY day, label;`;
  db.any(query)
    .then(response => {
      const vehicles = response
        .filter(item => item.label === "Vehicle")
        .map(item => {
          return { x: item.day, y: parseInt(item.sum) };
        });
      const pedestrians = response
        .filter(item => item.label === "Pedestrian")
        .map(item => {
          return { x: item.day, y: parseInt(item.sum) };
        });
      const bikes = response
        .filter(item => item.label === "Bike")
        .map(item => {
          return { x: item.day, y: parseInt(item.sum) };
        });
      res.status(200).json({
        vehicles: _.sortBy(vehicles, "x"),
        pedestrians: _.sortBy(pedestrians, "x"),
        bikes: _.sortBy(bikes, "x")
      });
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

module.exports = {
  getHourlyTrendOverToday,
  getDailyTrendOverPastWeek,
  getDailyTrendOverPastMonth
};
