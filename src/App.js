import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { Table, Form, Input, message, Divider, notification} from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { Tabs } from "antd";
import { io } from 'socket.io-client'
const { TabPane } = Tabs;

function App() {
  const [newNotif, setNewNotif] = useState();
  const [startDate, setStartDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [products, setProducts] = useState();
  const [refresh, setRefresh] = useState(true);
  const [form] = Form.useForm();
  const [notifications, setNotifications] = useState();
  const [notifications1, setNotifications1] = useState();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleClose1 = () => setShow1(false);
  const handleShow1 = () => setShow1(true);

  //client-side

  const columns = [
    {
      title: "Produit",
      dataIndex: "nom",
      key: "nom",
    },
    {
      title: "Date expiration",
      dataIndex: "dateExp",
      render: (date) => <a>{moment(date).format("DD-MM-YYYY")}</a>,
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'x',
      render: (text, record) => (
        <Button
          onClick={(e) => { deleteProduct(record._id); }}
        >
          Delete
        </Button>
      ),
    },
  ];

  const columns1 = [
    {
      title: "Temperature",
      dataIndex: "temperature",
      render: (temperature) => <a>{`${temperature} C`}</a>,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => <a>{moment(date).format("LLL")}</a>,
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'x',
      render: (text, record) => (
        <Button
          onClick={(e) => { deleteNotification(record._id); }}
        >
          Delete
        </Button>
      ),
    },
  ];

  const columns2 = [
    {
      title: "Produit",
      dataIndex: "product",
      key: "product.nom",
      render: ({ nom }) => <a>{nom}</a>,
    },
    {
      title: "Date expiration",
      dataIndex: "product.dateExp",
      render: (date) => <a>{moment(date).format("DD-MM-YYYY")}</a>,
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'x',
      render: (text, record) => (
        <Button
          onClick={(e) => { deleteNotification(record._id); }}
        >
          Delete
        </Button>
      ),
    },
  ];

  const onFinish = async (values) => {
    try {
      await axios.post("http://localhost:8000/products/", values);
      console.log("Success:", values);
      message.success("Le produit a bien été ajouté");
      setRefresh(!refresh);
      form.resetFields();
    } catch (e) {
      console.log(e);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const getProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/products/");
      setProducts(data);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteProduct = async (id) => {
    try {
      console.log(id)
      await axios.delete(`http://localhost:8000/products/${id}`);
      setRefresh(!refresh);
    } catch (e) {
      console.log(e);
    } 
  }

  const getNotifications = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/notifications/temperature"
      );
      setNotifications(data);
    } catch (e) {
      console.log(e);
    }
  };

  const getNotifications1 = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/notifications/expiration"
      );
      setNotifications1(data);
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteNotification = async (id) => {
    try {
      console.log(id)
      await axios.delete(`http://localhost:8000/notifications/${id}`);
      setRefresh(!refresh);
    } catch (e) {
      console.log(e);
    } 
  };

  

  useEffect(() => {
    getProducts();
    getNotifications();
    getNotifications1();
  }, [refresh]);

    useEffect(() => {
      const socket = io("http://localhost:3031");
    socket.on("popup", (arg) => {  
      console.log(arg);
      notification.open({
        message: arg.title,
        description:
          arg.description,
        onClick: () => {
          console.log('Notification Clicked!');
        },
      });
    });
  }, []);
  return (
    <Container>
      <Row>
        <Card style={{ marginTop: 50, marginBottom: 50 }}>
          <Card.Body>
            <Row>
              <Col>
                <Button variant="primary" onClick={handleShow}>
                  Produits
                </Button>
              </Col>
              <Col>
                <Button variant="primary" onClick={handleShow1}>
                  Notifications
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Row>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Liste des produits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table dataSource={products} columns={columns} />;
          <Divider plain>Ajouter un produit</Divider>
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            form={form}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item label="Produit" name="nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Date expiration" name="dateExp" rules={[{ required: true }]}>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={show1} onHide={handleClose1}>
        <Modal.Header closeButton>
          <Modal.Title>Liste des produits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Notification Temprature" key="1">
              <Table dataSource={notifications} columns={columns1} />
            </TabPane>
            <TabPane tab="Notification Expiration" key="2">
              <Table dataSource={notifications1} columns={columns2} />{" "}
            </TabPane>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose1}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose1}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;
