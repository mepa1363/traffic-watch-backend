const db = require("./config");

const get = (req, res) => {
  const whereClause =
    req.params.id !== undefined ? `WHERE id=${req.params.id}` : "";
  const query = `SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(feature)
      ) as features
      FROM (
        SELECT jsonb_build_object(
          'type',       'Feature',
          'id',         id,
          'geometry',   ST_AsGeoJSON(location)::jsonb,
          'properties', to_jsonb(inputs) - 'id' - 'location' - 'longitude' - 'latitude'
        ) AS feature
        FROM (
          SELECT * FROM camera ${whereClause}
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

module.exports = { get };
