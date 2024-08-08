/** @jsxImportSource @emotion/react */
import { Card, Col, Container, Row } from "react-bootstrap";
import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { getAllBranches } from "../utils/ApiFunctions";

const PopularBranch = () => {
    const [branches, setBranches] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        getAllBranches()
            .then((data) => {
                setBranches(data);
                setIsLoading(false);
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div className="mt-5">Loading branches....</div>;
    }
    if (errorMessage) {
        return <div className="text-danger mb-5 mt-5">Error : {errorMessage}</div>;
    }

    return (
        <section className="bg-light mb-5 mt-5 shadow">
            <div className="section-header">
                <h2>Our Popular Branches</h2>
                <p>Explore the greatest places in the city</p>
            </div>
            <Container>
                <Row>
                    {branches.map(branch => (
                        <Col key={branch.id} className="mb-4" xs={12} md={6} lg={3}>
                            <Card>
                                <Link to={`/hotel/branch/${branch.id}/`}>
                                    <Card.Img
                                        variant="top"
                                        src={branch.image.replace("image/upload/", "")}
                                        alt={branch.name}
                                        className="w-100"
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                </Link>
                                <Card.Body>
                                    <Card.Title className="hotel-color">{branch.name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{branch.address}</Card.Subtitle>
                                    <Card.Text as="div">
                                        <div className="mb-2">
                                            <i className="fa fa-phone"></i> {branch.phone}
                                        </div>
                                        <div className="mb-2">
                                            <i className="fa fa-envelope"></i> {branch.email}
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="star-rating">⭐️⭐️⭐️⭐️⭐️</div>
                                            <div className="ml-2"><i className="fa fa-eye"></i> {branch.views}</div>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default PopularBranch;
