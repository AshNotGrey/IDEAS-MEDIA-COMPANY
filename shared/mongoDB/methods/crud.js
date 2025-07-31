exports.createOne = Model => async data => await new Model(data).save();
exports.getAll = Model => async filter => await Model.find(filter);
exports.getOne = Model => async id => await Model.findById(id);
exports.updateOne = Model => async (id, data) => await Model.findByIdAndUpdate(id, data, { new: true });
exports.deleteOne = Model => async id => await Model.findByIdAndDelete(id); 