

const fetchHeader = () => ({
  "X-CSRFToken": getCookie('csrftoken'),
})


export const addRun = (waypoints) => (
  fetch('http://127.0.0.1:8000/api/run', {
    method: 'POST',
    body: JSON.stringify(waypoints)
  })
);
