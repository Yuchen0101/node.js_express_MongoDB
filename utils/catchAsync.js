// this catchAsync function returns a wrapper function, because this catchAsync function needs to return a function definition
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // if the code inside the param async function throws an error -> the async function returns a rejected promise -> we can catch it using 'next'
  };
};
