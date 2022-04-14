const multer = require('multer');
var randomstring = require("randomstring");
const fs = require('fs');
var path = require('path');

let uploadFile = (field, folderDes = 'users', fileLength = 10, fileSizeMb = 2, fileExtension = 'jpg|jpeg|png|gif') => {

  // upload
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, folder_uploads + folderDes)
    },
    filename: function (req, file, cb) {
      cb(null, randomstring.generate(fileLength) + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: fileSizeMb * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      const filetypes = new RegExp(fileExtension);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      // const minetype = filetypes.test(file.minetype);
      if (extname) {
        return cb(null, true);
      } else {
        cb('file upload not image')
      }
    }
  });

  return upload.single(field)
}

let removeFile = (folder, fileName) => {
  if (fileName !== "" && fileName !== undefined) {
    let path = folder + fileName;
    if (fs.existsSync(path)) {
      fs.unlink(path, err => { if (err) throw err });
    }
  }
}

module.exports = {
  upload: uploadFile,
  remove: removeFile,
}