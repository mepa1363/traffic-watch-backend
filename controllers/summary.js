// const _ = require("lodash");
const db = require("./config");

const getCurrentTotalCount = (req, res) => {
  const cameraId = req.params.id;
  const when = req.params.when;
  let temporalWindow = "";
  let temporalCondition = "";
  if (when === "today") {
    temporalWindow = "minute";
    temporalCondition = "date_trunc('minute', a.time) = b.time";
  } else if (when === "past-week") {
    temporalWindow = "day";
    temporalCondition = "a.time::date > b.time - INTERVAL '1 WEEK'";
  } else if (when === "past-month") {
    temporalWindow = "day";
    temporalCondition = "a.time::date > b.time - INTERVAL '1 MONTH'";
  }
  // return sum of count for each object type for current time (latest observation) for a given camera and all cameras
  const query =
    cameraId === "all"
      ? `WITH max_time AS (SELECT max(date_trunc('${temporalWindow}', time)) AS time FROM count),
              processing AS (SELECT sum(count)::int as count,
                              CASE
                                WHEN label='bus' OR label='car' OR label='truck' OR label='motorbike' THEN 'Vehicle'
                                WHEN label='bicycle' THEN 'Bike'
                                WHEN label='person' THEN 'Pedestrian'
                                END AS label
                              FROM count AS a, max_time AS b
                              WHERE ${temporalCondition} AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                              GROUP BY a.label)
          SELECT sum(count), label FROM processing GROUP BY label;`
      : `WITH max_time AS (SELECT max(date_trunc('${temporalWindow}', time)) AS time FROM count WHERE camera_id=${cameraId}),
              processing AS (SELECT sum(count)::int as count,
                              CASE
                                WHEN label='bus' OR label='car' OR label='truck' OR label='motorbike' THEN 'Vehicle'
                                WHEN label='bicycle' THEN 'Bike'
                                WHEN label='person' THEN 'Pedestrian'
                                END AS label
                              FROM count AS a, max_time AS b
                              WHERE ${temporalCondition} AND camera_id=${cameraId} AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                              GROUP BY a.label)
          SELECT sum(count), label FROM processing GROUP BY label;`;
  db.any(query)
    .then(response => {
      res.status(200).json(response);
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

const getCommunitySummary = (req, res) => {
  const when = req.params.when;
  let temporalWindow = "";
  let temporalCondition = "";
  if (when === "today") {
    temporalWindow = "minute";
    temporalCondition = "date_trunc('minute', a.time) = b.time";
  } else if (when === "past-week") {
    temporalWindow = "day";
    temporalCondition = "a.time::date > b.time - INTERVAL '1 WEEK'";
  } else if (when === "past-month") {
    temporalWindow = "day";
    temporalCondition = "a.time::date > b.time - INTERVAL '1 MONTH'";
  }
  const query = `SELECT jsonb_build_object(
                              'type', 'FeatureCollection',
                              'features', jsonb_agg(feature)
                          ) as features
                FROM (
                        SELECT jsonb_build_object(
                                        'type', 'Feature',
                                        'geometry', ST_AsGeoJSON(geom)::jsonb,
                                        'properties', to_jsonb(inputs) - 'geom'
                                    ) AS feature
                        FROM (
                                  WITH max_time AS (SELECT max(date_trunc('${temporalWindow}', time)) AS time FROM count),
                                  total_preprocssing AS (SELECT sum(count) as count,
                                                                CASE
                                                                    WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                                                        THEN 'Vehicle'
                                                                    WHEN label = 'bicycle' THEN 'Bike'
                                                                    WHEN label = 'person' THEN 'Pedestrian'
                                                                    END    AS label
                                                          FROM count
                                                          WHERE label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                                                          GROUP BY label),
                                  total AS (SELECT sum(count) as count, label from total_preprocssing GROUP BY label),
                                  processing AS (SELECT d.name,
                                                        sum(a.count) as count,
                                                        CASE
                                                            WHEN label = 'bus' OR label = 'car' OR label = 'truck' OR label = 'motorbike'
                                                                THEN 'Vehicle'
                                                            WHEN label = 'bicycle' THEN 'Bike'
                                                            WHEN label = 'person' THEN 'Pedestrian'
                                                            END      AS label
                                                  FROM count AS a,
                                                      max_time AS b,
                                                      camera AS c,
                                                      calgary_communities AS d
                                                  WHERE ${temporalCondition}
                                                    AND label IN ('bus', 'car', 'truck', 'motorbike', 'bicycle', 'person')
                                                    AND a.camera_id = c.id
                                                    AND st_intersects(c.location, d.geom)
                                                  GROUP BY a.label, d.name)
                              SELECT a.name, a.label, sum(a.count) / sum(b.count) as rate, c.geom
                              from processing AS a,
                                  total AS b,
                                  calgary_communities AS c
                              WHERE c.name = a.name
                              group by a.name, a.label, c.geom
                              ) inputs
                    ) features;`;
  db.any(query)
    .then(response => {
      res.status(200).json(response[0].features);
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

module.exports = { getCurrentTotalCount, getCommunitySummary };
