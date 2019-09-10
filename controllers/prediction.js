const axios = require("axios");

const get = (req, res) => {
  const cameraId = req.params.id;
  axios
    .post(
      "http://34.223.100.198:5000/predict",
      { cameraId: cameraId, steps: 48 },
      { headers: { "Content-Type": "application/json" } }
    )
    .then(response => {
      const result = response.data;
      const observation = result.historical.map(item => {
        return { x: item.time, y: parseInt(item.count) };
      });
      const prediction = result.prediction.map(item => {
        return { x: item.time, y: parseInt(item.count) };
      });
      prediction.unshift(observation[0]);
      res.json({ observation: observation, prediction: prediction });
    })
    .catch(error => {});
};

module.exports = { get };
