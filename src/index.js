const { response } = require("express");
var express = require("express");
var app = express();
// var moment = require("moment");
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.listen(5001, function () {
  console.log("hi");
});
var mysql = require("mysql");
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "multiple_choice_2",
});
db.connect(function (err) {
  if (err) throw err;
  console.log("Connected!!!");
});
//--------------------------------------------------------------------------------------------------
// Thêm, sửa, xoá user
// Thêm user
app.post("/api/user-add", (req, res) => {
  const { name } = req.body;
  if (name && typeof name === "string") {
    let sql = `INSERT INTO user(name) VALUES ('${name}')`;
    db.query(sql, (err, data) => {
      if (err) throw err;
      res.send("Thêm thành công!");
    });
  } else {
    res.send("Nhập lại dữ liệu!");
  }
});
// Sửa user
app.post("/api/user-update/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (id) {
    let sql_check = `select * from user where id = ${id} and is_delete = 0`;
    db.query(sql_check, (err, data) => {
      if (err) throw err;
      if (data.length > 0 && name && typeof name === "string") {
        let sql = `INSERT INTO user( name) VALUES ('${name}')`;
        db.query(sql, (err, data) => {
          if (err) throw err;
          res.send("Sửa thành công!");
        });
      } else {
        res.send("Nhập lại dữ liệu!");
      }
    });
  }
});
// Xoá user
app.delete("/api/user-delete/:id", (req, res) => {
  const { id } = req.params;
  if (id) {
    let sql_check = `SELECT is_delete FROM user WHERE id = ${id} and is_delete = 0`;
    db.query(sql_check, (err, data) => {
      if (err) throw err;
      if (data.length > 0 && data[0].is_delete === 0) {
        let sql = `UPDATE user SET is_delete='1' WHERE id = ${id}`;
        db.query(sql, (err, data) => {
          if (err) throw err;
          res.send("Xoá thành công!");
        });
      } else {
        res.send("Không có dữ liệu!");
      }
    });
  }
});
// Thêm sửa xoá question
// Thêm question
app.post("/api/question-add", (req, res) => {
  const { question_name, answer_name, is_checked } = req.body;
  if (
    question_name &&
    typeof question_name === "string" &&
    answer_name &&
    typeof answer_name === "object" &&
    is_checked &&
    typeof is_checked === "number" &&
    answer_name.length >= is_checked
  ) {
    let sql = `INSERT INTO question( name) VALUES ('${question_name}')`;
    db.query(sql, (err, data) => {
      if (err) throw err;
      let question_id = data.insertId;
      for (let i = 0; i < answer_name.length; i++) {
        let sql = `INSERT INTO answer( question_id, name, correct_answer,is_checked) VALUES ('${question_id}','${
          answer_name[i]
        }',${is_checked},${is_checked - 1 === i})`;
        db.query(sql, (err, data) => {
          if (err) throw err;
        });
      }
      res.send("Thêm thành công!");
    });
  } else {
    res.send("Nhập lại dữ liệu!");
  }
});
// Sửa question
app.post("/api/question-update/:id", (req, res) => {
  const { id } = req.params;
  const { question_name, answer_name, is_checked } = req.body;
  if (id) {
    let sql_check = `SELECT * FROM question WHERE id = ${id} and is_delete = 0`;
    db.query(sql_check, (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        if (
          question_name &&
          typeof question_name === "string" &&
          answer_name &&
          typeof answer_name === "object" &&
          is_checked &&
          typeof is_checked === "number" &&
          answer_name.length >= is_checked
        ) {
          let sql = `UPDATE question SET name='${question_name}' WHERE id = ${id}`;
          db.query(sql, (err, data) => {
            if (err) throw err;
            for (let i = 0; i < answer_name.length; i++) {
              let sql = `SELECT id  FROM answer WHERE question_id = ${id} and is_delete = 0`;
              db.query(sql, (err, data) => {
                if (err) throw err;
                let sql = `UPDATE answer SET name='${
                  answer_name[i]
                }',correct_answer = ${is_checked},is_checked=${
                  is_checked - 1 === i
                } WHERE question_id = ${id} and id = ${data[i].id}`;
                db.query(sql, (err, data) => {
                  if (err) throw err;
                });
              });
            }
            res.send("Sửa thành công");
          });
        } else {
          res.send("Nhập lại dữ liệu!");
        }
      } else {
        res.send("Không có dữ liệu!");
      }
    });
  }
});
// xoá question
app.delete("/api/question-delete/:id", (req, res) => {
  const { id } = req.params;
  if (id) {
    let sql_check = `SELECT * FROM question WHERE id = ${id} and is_delete = 0`;
    db.query(sql_check, (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        let sql_question = `UPDATE question SET is_delete='1' WHERE id = ${id}`;
        db.query(sql_question, (err, data) => {
          if (err) throw err;
          let sql_answer = `UPDATE answer SET is_delete='1' WHERE question_id =  ${id}`;
          db.query(sql_answer, (err, data) => {
            if (err) throw err;
            res.send("Xoá thành công!");
          });
        });
      } else {
        res.send("Không có dữ liệu!");
      }
    });
  }
});
//Thêm, sửa, xoá test
// Thêm test
app.post("/api/test-add", (req, res) => {
  const { question_id, name } = req.body;
  if (
    question_id &&
    typeof question_id === "object" &&
    name &&
    typeof name === "string"
  ) {
    question_id.forEach((element) => {
      let sql_check = `SELECT * FROM question WHERE id = ${element} and is_delete = 0`;
      db.query(sql_check, (err, data) => {
        if (err) throw err;
        if (data.length < 1) {
          res.send(`Không tồn tại question có id = ${element}`);
        }
      });
    });
    // console.log(question_id);
    let sql = `INSERT INTO test( question_id, name) VALUES ('[${question_id}]','${name}')`;
    // console.log(sql);
    db.query(sql, (err, data) => {
      if (err) throw err;
      let test_id = data.insertId;
      question_id.forEach((element) => {
        ////==================================
        let sql_test_question = `INSERT INTO test_question(test_id, question_id) VALUES ('${test_id}','${element}')`;
        db.query(sql_test_question, (err, data) => {
          if (err) throw err;
        });
      });
      res.send("Thêm đề thành công!");
    });
  } else {
    res.send("Nhập lại dữ liệu!");
  }
});
// Sửa test
app.post("/api/test-update/:id", (req, res) => {
  const { id } = req.params;
  const { question_id, name } = req.body;
  if (id) {
    let sql_check = `SELECT * FROM test WHERE id = ${id} and is_delete = 0`;
    db.query(sql_check, (err, data) => {
      if (err) throw err;
      if (
        data.length > 0 &&
        question_id &&
        typeof question_id === "object" &&
        name &&
        typeof name === "string"
      ) {
        question_id.forEach((element) => {
          let sql_check = `SELECT * FROM question WHERE id = ${element} and is_delete = 0`;
          db.query(sql_check, (err, data) => {
            if (err) throw err;
            if (data.length < 1) {
              res.send(`Không tồn tại question có id = ${element}`);
            }
          });
        });
        let sql = `UPDATE test SET question_id='[${question_id}]',name='${name}' WHERE id = ${id}`;
        db.query(sql, (err, data) => {
          if (err) throw err;
          // let test_id = data.insertId;
          let sql_delete_test_question = `UPDATE test_question SET is_delete='1' WHERE test_id = ${id}`;
          db.query(sql_delete_test_question, (err, data) => {
            if (err) throw err;
            question_id.forEach((element) => {
              let sql_test_question = `INSERT INTO test_question(test_id, question_id) VALUES ('${id}','${element}')`;
              db.query(sql_test_question, (err, data) => {
                if (err) throw err;
              });
            });
            res.send("Sửa thành công!");
          });
        });
      } else {
        res.send("Nhập lại dữ liệu!");
      }
    });
  }
});
// xoá test
app.delete("/api/test-delete/:id", (req, res) => {
  const { id } = req.params;
  if (id) {
    let sql_check = `SELECT * FROM test WHERE id =${id} and is_delete = 0`;
    db.query(sql_check, (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        let sql = `UPDATE test SET is_delete='1' WHERE id = ${id}`;
        db.query(sql, (err, data) => {
          if (err) throw err;
          res.send("Xoá thành công!");
        });
      } else {
        res.send("Không có dữ liệu!");
      }
    });
  }
});
// Thêm, sửa, xoá user_test
// thêm user_test
app.post("/api/user_test-add", (req, res) => {
  const { user_id, test_id, question_id, answer } = req.body;
  if (
    typeof user_id === "number" &&
    typeof test_id === "number" &&
    typeof question_id === "number" &&
    typeof answer === "number"
  ) {
    let sql_check_user = `SELECT * FROM user WHERE id = ${user_id} and is_delete = 0`;
    db.query(sql_check_user, (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        let sql_check_test = `SELECT question_id FROM test WHERE id = ${test_id} and is_delete = 0`;
        db.query(sql_check_test, (err, data) => {
          if (err) throw err;
          if (data.length > 0 && data[0].question_id.includes(question_id)) {
            let sql_check_question = `SELECT * FROM question WHERE id = ${question_id} and is_delete = 0`;
            db.query(sql_check_question, (err, data) => {
              if (err) throw err;
              if (data.length > 0) {
                // check xem dữ liệu đã có trong bảng user_test chưa
                let sql_check_user_test = `SELECT * FROM user_test WHERE user_id = ${user_id} AND test_id = ${test_id} AND question_id = ${question_id}`;
                db.query(sql_check_user_test, (err, data) => {
                  if (err) throw err;
                  if (data.length < 1) {
                    let sql_check_is_checked = `SELECT is_checked FROM answer WHERE answer.question_id = ${question_id} and is_delete = 0`;
                    db.query(sql_check_is_checked, (err, data) => {
                      if (err) throw err;
                      if (0 < answer <= data.length) {
                        let check = 0;
                        for (let i = 0; i < data.length; i++) {
                          if (data[i].is_checked === 1 && i + 1 === answer) {
                            // console.log(`check`);
                            check = 1;
                            break;
                          }
                        }
                        let sql = `INSERT INTO user_test(user_id, test_id, question_id, answer, is_complete) VALUES ('${user_id}','${test_id}','${question_id}','${answer}',${check})`;
                        // console.log(sql);
                        db.query(sql, (err, data) => {
                          if (err) throw err;
                          res.send("Thêm thành công!");
                        });
                      } else {
                        res.send("Nhập lại dữ liệu answer!");
                      }
                    });
                  } else {
                    res.send(
                      "Dữ liệu đã tồn tại trong db, chọn update để sửa!"
                    );
                  }
                });
                // check xong dữ liệu đầu vào user_id, test_id, question_id
                // xem lại chỗ này.....
              } else {
                res.send("Không có dữ liệu question!");
              }
            });
          } else {
            res.send("Không có dữ liệu test!/ Question không thuộc test này!");
          }
        });
      } else {
        res.send("Không có dữ liệu user!");
      }
    });
    // res.send("true");
  }
});
// sửa user_test
app.post("/api/user_test-update/:id", (req, res) => {
  const { id } = req.params;
  const { user_id, test_id, question_id, answer } = req.body;
  if (id) {
    let sql_check_user_test = `SELECT is_delete  FROM  user_test  WHERE id =${id} AND is_delete = 0`;
    db.query(sql_check_user_test, (err, data) => {
      if (err) throw err;
      if (
        data.length > 0 &&
        typeof user_id === "number" &&
        typeof test_id === "number" &&
        typeof question_id === "number" &&
        typeof answer === "number"
      ) {
        let sql_check_user = `SELECT * FROM user WHERE id = ${user_id} and is_delete = 0`;
        db.query(sql_check_user, (err, data) => {
          if (err) throw err;
          if (data.length > 0) {
            let sql_check_test = `SELECT question_id FROM test WHERE id = ${test_id} and is_delete = 0`;
            db.query(sql_check_test, (err, data) => {
              if (err) throw err;
              if (
                data.length > 0 &&
                data[0].question_id.includes(question_id)
              ) {
                let sql_check_question = `SELECT * FROM question WHERE id = ${question_id} and is_delete = 0`;
                db.query(sql_check_question, (err, data) => {
                  if (err) throw err;
                  if (data.length > 0) {
                    let sql_check_is_checked = `SELECT is_checked FROM answer WHERE answer.question_id = ${question_id} and is_delete = 0`;
                    db.query(sql_check_is_checked, (err, data) => {
                      if (err) throw err;
                      if (0 < answer <= data.length) {
                        let check = 0;
                        for (let i = 0; i < data.length; i++) {
                          if (data[i].is_checked === 1 && i + 1 === answer) {
                            return (check = 1);
                          }
                        }
                        let sql = `UPDATE user_test SET user_id='${user_id}',test_id='${test_id}',question_id='${question_id}',answer='${answer}',is_complete='${check}' WHERE id = ${id}`;
                        db.query(sql, (err, data) => {
                          if (err) throw err;
                          res.send("Sửa thành công!");
                        });
                      }
                    });
                  }
                });
              } else {
                res.send(
                  "Không có dữ liệu test!/Question không thuộc test này!"
                );
              }
            });
          } else {
            res.send("Không có dữ liệu user!");
          }
        });
      } else {
        res.send("Nhập lại dữ liệu!");
      }
    });
  }
});
// xoá user_test
app.delete("/api/user_test-delete/:id", (req, res) => {
  const { id } = req.params;
  if (id) {
    let sql_check = `SELECT is_delete FROM user_test WHERE id = ${id} and is_delete = 0`;
    db.query(sql_check, (err, data) => {
      if (err) throw err;
      // console.log(data[0].is_delete === 0);
      // res.send(data[0].is_delete === 0);
      if (data.length > 0 && data[0].is_delete === 0) {
        let sql = `UPDATE user_test SET is_delete='1' WHERE id = ${id}`;
        db.query(sql, (err, data) => {
          if (err) throw err;
          res.send("Xoá thành công!");
        });
      } else {
        res.send("Không có dữ liệu!");
      }
    });
  }
});
// Thêm dữ liệu vào bảng result
app.post("/api/result-add", (req, res) => {
  // 'Weak','Average','Good','Excellent'
  // INSERT INTO `result`(`user_test_id`, `user_id`, `test_id`, `point`, `classification`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]')
  const { user_id, test_id } = req.body;
  if (typeof user_id === "number" && typeof test_id === "number") {
    let sql_check_user = `SELECT * FROM user WHERE id = ${user_id} AND is_delete = 0`;
    db.query(sql_check_user, (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        let sql_check_test = `SELECT * FROM test WHERE id = ${test_id} AND is_delete = 0`;
        db.query(sql_check_test, (err, data) => {
          if (err) throw err;
          if (data.length > 0) {
            let sql_check_result = `SELECT * FROM result WHERE user_id = ${user_id} AND test_id = ${test_id}`;
            db.query(sql_check_result, (err, data) => {
              if (err) throw err;
              if (data < 1) {
                let sql_count = `SELECT question_id FROM test WHERE  id =  ${test_id}`;
                db.query(sql_count, (err, data) => {
                  if (err) throw err;
                  //-------------------
                  let count = JSON.parse(data[0].question_id).length;
                  if (data.length > 0) {
                    let sql_count_correct = `SELECT COUNT(*) AS correct  FROM user_test WHERE is_complete = 1 AND user_id = ${user_id} AND test_id = ${test_id}`;
                    db.query(sql_count_correct, (err, data) => {
                      if (err) throw err;
                      let point = (10 / count) * data[0].correct;
                      if (0 <= point && point < 4) {
                        let sql = `INSERT INTO result(user_id, test_id, point, classification) VALUES ('${user_id}','${test_id}','${point}',1)`;
                        db.query(sql, (err, data) => {
                          if (err) throw err;
                          res.send("Thêm kết quả thành công!");
                        });
                      }
                      if (4 <= point && point < 6.5) {
                        let sql = `INSERT INTO result(user_id, test_id, point, classification) VALUES ('${user_id}','${test_id}','${point}',2)`;
                        db.query(sql, (err, data) => {
                          if (err) throw err;
                          res.send("Thêm kết quả thành công!");
                        });
                      }
                      if (6.5 <= point && point < 8.5) {
                        let sql = `INSERT INTO result(user_id, test_id, point, classification) VALUES ('${user_id}','${test_id}','${point}',3)`;
                        db.query(sql, (err, data) => {
                          if (err) throw err;
                          res.send("Thêm kết quả thành công!");
                        });
                      }
                      if (8.5 <= point && point <= 10) {
                        let sql = `INSERT INTO result(user_id, test_id, point, classification) VALUES ('${user_id}','${test_id}','${point}',4)`;
                        db.query(sql, (err, data) => {
                          if (err) throw err;
                          res.send("Thêm kết quả thành công!");
                        });
                      }
                    });
                  } else {
                    res.send("Không có dữ liệu trong user_test!");
                  }
                });
              } else {
                res.send("Đã tồn tại dữ liệu, chọn update!");
              }
            });
          } else {
            res.send(`Không có dữ liệu test với id = ${test_id}`);
          }
        });
      } else {
        res.send(`Không có dữ liệu user có id =  ${user_id}`);
      }
    });
  }
});
// Sửa dữ liệu bảng result

// hiển thị kết quả bài test( hiển thị câu đúng, nếu sai thì trả ra đáp án đúng)
app.get("/api/select-test-results/:user_id/:test_id", (req, res) => {
  const { user_id, test_id } = req.params;
  if (user_id && test_id) {
    let sql_check_user_test = `SELECT question_id, answer, is_complete, is_delete FROM user_test WHERE user_id = ${user_id} AND test_id = ${test_id} AND is_delete = 0`;
    db.query(sql_check_user_test, (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        let sql = `SELECT  user_test.question_id , user_test.answer, user_test.is_complete , answer.correct_answer FROM user_test
        INNER JOIN answer ON answer.question_id = user_test.question_id
        WHERE user_id = ${user_id} AND test_id = ${test_id} AND answer.is_checked = 1`;
        db.query(sql, (err, data) => {
          if (err) throw err;
          res.send(data);
        });
      } else {
        res.send("Không có dữ liệu trong bảng user_test!");
      }
    });
  }
  // res.send(`${user_id}   ${test_id}`);
});
// hiển thị đã làm bài test rồi
app.get("/api/check-done/:user_id/:test_id", (req, res) => {
  const { user_id, test_id } = req.params;
  if (user_id && test_id) {
    let sql_check_user_test = `SELECT * FROM user_test WHERE user_id = ${user_id} and test_id = ${test_id}`;
    // console.log(sql_check_user_test);
    db.query(sql_check_user_test, (err, data) => {
      if (err) throw err;
      if (data.length > 0) {
        res.send("Đã làm bài thi!");
      } else {
        res.send("Chưa làm bài thi!");
      }
    });
  }
});
// Xoá dữ liệu bảng result
// API để check------------------------------
app.get("/api/question-check", (req, res) => {
  let sql = `SELECT question_id FROM test WHERE  id = 1`;
  db.query(sql, (err, data) => {
    if (err) throw err;
    const question_id = JSON.parse(data[0].question_id);
    console.log(JSON.parse(data[0].question_id).length);
    // console.log(question_id.length);
  });
});
app.get("/api/test", (req, res) => {
  res.send("<h1>Long</h1>");
});
