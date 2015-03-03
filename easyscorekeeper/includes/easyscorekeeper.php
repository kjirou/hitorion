<?php
/**
 * easyscorekeeper
 *
 * @php_version >= 5.3
 * @dependency PHP SQLite3 module <http://www.php.net/manual/en/book.sqlite3.php>
 * @licence MIT Licence <http://www.opensource.org/licenses/mit-license.php>
 * @author kjirou <sorenariblog[at]google[dot]com> <http://blog.kjirou.net/>
 */
class EasyScorekeeperError extends Exception {}
class EasyScorekeeperNgError extends EasyScorekeeperError {}

class EasyScorekeeper {

    const VERSION = '0.0.2';

    private $data_root = './data';
    private $db_filename = 'easyscorekeeper.db';
    private $db = null;

    private $params = array();

    private $mode_key = 'm';
    private $mode = null;
    private $all_modes = array('new', 'list');

    private $jsonp_callback_key = 'c';
    /** jQuery.ajax send strings like 'jQuery1705597869567432656_1326204897902' */
    private $jsonp_callback = null;

    private $username_key = 'u';
    private $username = null;
    private $unknown_username = 'unknown';

    public function execute() {

        $this->initialize_db();

        $this->set_mode_from_params();
        $this->set_jsonp_callback_from_params();
        $this->set_username_from_params();

        try {
          if ($this->mode === 'new') {
            $this->execute_new();
          } else if ($this->mode === 'list') {
            $this->execute_list();
          }
        } catch (EasyScorekeeperNgError $err) {
          $this->output_response('ng', null, $err->getMessage());
        }

        $this->db->close();
    }

    private function execute_new() {

        // Score
        $score_str = @$this->params['score'];
        if (is_numeric($score_str) === false) {
            throw new EasyScorekeeperNgError('Invalid score');
        }
        $score = intval($score_str);

        // Category
        $category = strval(@$this->params['category']);
        // TODO: Add more validations
        if (strlen($category) > 64) {
            throw new EasyScorekeeperNgError('Invalid category');
        }

        // Comment
        $comment = strval(@$this->params['comment']);
        $comment = substr($comment, 0, 250);

        $sql = '
            INSERT INTO scores (
                created_at,
                username,
                score,
                category,
                comment
            ) VALUES (
                datetime("now"),
                :username,
                :score,
                :category,
                :comment
            );
        ';
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':username', $this->username, SQLITE3_TEXT);
        $stmt->bindValue(':score', $score, SQLITE3_INTEGER);
        $stmt->bindValue(':category', $category, SQLITE3_TEXT);
        $stmt->bindValue(':comment', $comment, SQLITE3_TEXT);
        $stmt->execute();

        $this->output_response('ok');
    }

    private function execute_list() {

        // Category
        $category = strval(@$this->params['category']);

        // Limit
        $limit = 100;

        $sql = '
          SELECT * FROM scores
          WHERE 1 = 1
        ';
        if ($category !== '') {
          $sql .= ' AND category = :category';
        }
        $sql .= '
          ORDER BY score DESC, created_at DESC
          LIMIT :limit
        ';

        $stmt = $this->db->prepare($sql);
        if ($category !== '') {
          $stmt->bindValue(':category', $category, SQLITE3_TEXT);
        }
        $stmt->bindValue(':limit', $limit, SQLITE3_INTEGER);
        $result = $stmt->execute();

        $list = array();
        $rank = 1;
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
          $row['rank'] = $rank;
          $rank += 1;
          $list[] = $row;
        }

        $this->output_response('ok', $list);
    }

    private function get_db_filepath() {
      return $this->data_root . '/' . $this->db_filename;
    }

    private function initialize_db() {
      $this->db = new SQLite3($this->get_db_filepath());
      if ($this->is_created_tables() === false) {
        $this->create_tables();
      }
    }

    private function is_created_tables() {
      $sql = 'SELECT * FROM sqlite_master WHERE type="table"';
      $result = $this->db->query($sql);
      return $result->fetchArray(SQLITE3_ASSOC) !== false;
    }

    private function create_tables() {
        $sql = '
          CREATE TABLE "scores" (
            "id" integer NOT NULL PRIMARY KEY,
            "created_at" datetime NOT NULL,
            "username" varchar(255) NOT NULL,
            "score" integer NOT NULL,
            "category" varchar(64) NOT NULL,
            "comment" varchar(255) NOT NULL
          );
        ';
        $this->db->query($sql);
    }

    public function add_params($params) {
        $this->params = array_merge($this->params, $params);
    }

    private function set_mode_from_params() {
        if (
            array_key_exists($this->mode_key, $this->params) &&
            in_array($this->params[$this->mode_key], $this->all_modes, true)
        ) {
            $this->mode = $this->params[$this->mode_key];
        } else {
            $this->mode = $this->all_modes[0];
        }
    }

    private function set_jsonp_callback_from_params() {
        if (
            array_key_exists($this->jsonp_callback_key, $this->params) &&
            preg_match('/^[_$a-zA-Z0-9]{1,128}$/', $this->params[$this->jsonp_callback_key]) > 0
        ) {
            $this->jsonp_callback = $this->params[$this->jsonp_callback_key];
        }
    }

    private function set_username_from_params() {
        if (
            array_key_exists($this->username_key, $this->params) &&
            preg_match('/^.{1,32}$/', $this->params[$this->username_key]) > 0
            #preg_match('/^[-_$a-zA-Z0-9]{1,32}$/', $this->params[$this->username_key]) > 0
        ) {
            $this->username = $this->params[$this->username_key];
        } else {
            $this->username = $this->unknown_username;
        }
    }

    private function create_response_body($status, $data = null, $message = null) {
        $status = (in_array($status, array('ok', 'ng'), true))? $status: 'ok';

        $json = json_encode(array(
            'status' => $status,
            'data' => $data,
            'message' => $message,
        ));

        if ($this->jsonp_callback !== null) {
            return "{$this->jsonp_callback}({$json})";
        } else {
            return $json;
        }
    }

    private function output_response(/* args passing */) {
        $args = func_get_args();
        $response_body = call_user_func_array(array($this, 'create_response_body'), $args);
        header('Content-type: text/plain');
        header('HTTP/1.0 200 OK'); // Always 200
        echo $response_body;
    }

    static public function auto_start() {
        global $_GET, $_POST;
        $obj = new self();
        $obj->add_params($_GET);
        $obj->add_params($_POST);
        $obj->execute();
    }
}
