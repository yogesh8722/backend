// helper file req aa jati h
// hr bar promises me nhi dalna padta try or catch me nhi dalna padta
const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}

export default asyncHandler