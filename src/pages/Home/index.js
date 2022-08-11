import axios from "axios";
import moment from "moment";
import { Loading } from "notiflix";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowDropDownIcon,
  CheckIcon,
  ClearIcon,
  CloseIcon,
  RestartAltSharpIcon
} from "../../components/icon";
import IconEyeClose from "../../components/icon/IconEyeClose";
import Paging from "../../components/paging";
import returningService from "./../../api/returningService";
import staffService from "./../../api/staffService";
import IconEyeOpen from "./../../components/icon/IconEyeOpen";
import "./home.scss";

const tableHeader = [
  {
    id: "assetCode",
    name: "Asset Code",
    isDropdown: true,
  },
  {
    id: "assetName",
    name: "Asset Name",
    isDropdown: true,
  },
  {
    id: "specification",
    name: "Specification",
    isDropdown: true,
  },
  {
    id: "assignTo",
    name: "Assigned To",
    isDropdown: true,
  },
  {
    id: "assignBy",
    name: "Assigned By",
    isDropdown: true,
  },
  {
    id: "assignedDate",
    name: "Assigned Date",
    isDropdown: true,
  },
  {
    id: "state",
    name: "State",
    isDropdown: true,
  },
];

const HomePage = () => {
  const rowPerPage = 15;
  const [isNew, setIsNew] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const [data, setData] = useState([]);
  const [numPage, setNumPage] = useState(0);
  const [page, setPage] = useState(1);

  const [createReturn, setCreateReturn] = useState();

  useEffect(() => {
    let status = localStorage.getItem("status");
    if (status === "NEW") {
      setIsNew(true);
    }
  }, []);

  const loadData = () => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    Loading.standard("Loading...");
    staffService
      .getListAssignments(userId)
      .then((res) => {
        const resData = res.data;
        if (resData.length === 0 && role === "STAFF") {
          toast.info("No assignment found!");
        }
        setData(resData);
        setNumPage(Math.ceil(resData.length / rowPerPage));
        Loading.remove();
      })
      .catch((err) => {
        Loading.remove();
        console.log(err);
        if (role === "STAFF") {
          toast.info("No assignment found!");
        }
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = (id) => {
    const state = "Accepted";
    Loading.standard("Loading...");
    staffService
      .updateStateAssignment(id, state)
      .then(() => {
        loadData();
        toast.success("Accept success!");
        Loading.remove();
      })
      .catch((err) => {
        console.log(err);
        Loading.remove();
        toast.error("Accept failed");
      });
  };

  const handleDecline = (id) => {
    const state = "Declined";
    Loading.standard("Loading...");
    staffService
      .updateStateAssignment(id, state)
      .then(() => {
        loadData();
        toast.success("Decline success!");
        Loading.remove();
      })
      .catch((err) => {
        console.log(err);
        Loading.remove();
        toast.error("Decline failed");
      });
  };

  const handleSavePassword = () => {
    if (newPassword) {
      // send to backend test
      const userId = localStorage.getItem("userId");

      axios({
        headers: {
          "content-type": "application/json",
        },
        url: `https://backend05.azurewebsites.net/api/auth/user/${userId}/${newPassword}`,
        method: "PUT",
      })
        .then(() => {
          setIsNew(false);
          localStorage.removeItem("status");
          toast.success("Change Password success!!!");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Can't change password");
        });
    } else {
      toast.error("New Password not Empty.");
    }
  };

  const handleCreateReturning = () => {
    const assId = createReturn;
    const requestBy = localStorage.getItem("username");

    returningService
      .createNewReturning(assId, requestBy)
      .then((res) => {
        if (res.status === 201) {
          toast.success(
            "Request for return successfully!. Forward to request for returning tab to view."
          );
          setCreateReturn(null);
          loadData();
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("cannot create request for returning. Try later");
      });
  };

  return (
    <>
      {/* Modal to show confirm  create new request for returning */}
      <div
        className={"modal fade " + (createReturn ? " show d-block" : " d-none")}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-danger">Are you sure?</h5>
            </div>
            <div className="modal-body confirm-disable">
              <div className="modal-subtitle">
                Do you want to create a returning request for this asset?
              </div>
              <div className="button">
                <button
                  className="btn btn-danger"
                  id="disable-button"
                  onClick={handleCreateReturning}
                >
                  Yes
                </button>
                <button
                  className="btn btn-outline-secondary"
                  id="cancel-button"
                  onClick={() => setCreateReturn(null)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* end of modal */}

      {/* change password for first login */}
      <div
        className={"modal fade " + (isNew ? " show d-block" : " d-none")}
        tabIndex="-1"
        role="dialog"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-danger">Change Password</h5>
            </div>
            <div class="modal-body">
              <div className="text">
                <h6>
                  This is a first time you logged in. <br /> You have to change
                  password to continue.
                </h6>
              </div>
              <div className="change-password">
                <label htmlFor="pass" className="pe-1">
                  New Password
                </label>
                <input
                  type={togglePassword ? "text" : "password"}
                  id="pass"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {!togglePassword ? (
                  <IconEyeClose
                    className="icon-eye"
                    onClick={() => setTogglePassword(true)}
                  ></IconEyeClose>
                ) : (
                  <IconEyeOpen
                    className="icon-eye"
                    onClick={() => setTogglePassword(false)}
                  ></IconEyeOpen>
                )}
              </div>
              <div className="button-save">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleSavePassword}
                  id="btnSave"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="table-assignments w-100">
        <div className="title">
          <h3>My Assignment</h3>
        </div>
        <table className="w-100">
          <thead>
            <tr>
              {tableHeader.map((item) => (
                <th className="border-bottom border-3" key={item.id}>
                  {item.name}
                  <button className="btn border-0" id={`sortBy${item.name}`}>
                    {item.isDropdown ? <ArrowDropDownIcon /> : <></>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.slice((page - 1) * rowPerPage, page * rowPerPage) || []).map(
              (ele) => {
                return (
                  <>
                    <tr key={ele.id}>
                      <td
                        className="border-bottom"
                        data-bs-toggle="modal"
                        data-bs-target={"#detailAssignmentModal" + ele.id}
                      >
                        {ele.assetCode}
                      </td>
                      <td
                        className="border-bottom"
                        data-bs-toggle="modal"
                        data-bs-target={"#detailAssignmentModal" + ele.id}
                      >
                        {ele.assetName}
                      </td>
                      <td
                        className="border-bottom"
                        data-bs-toggle="modal"
                        data-bs-target={"#detailAssignmentModal" + ele.id}
                      >
                        {ele.specification}
                      </td>
                      <td
                        className="border-bottom"
                        data-bs-toggle="modal"
                        data-bs-target={"#detailAssignmentModal" + ele.id}
                      >
                        {ele.assignTo}
                      </td>
                      <td
                        className="border-bottom"
                        data-bs-toggle="modal"
                        data-bs-target={"#detailAssignmentModal" + ele.id}
                      >
                        {ele.assignBy}
                      </td>
                      <td
                        className="border-bottom"
                        data-bs-toggle="modal"
                        data-bs-target={"#detailAssignmentModal" + ele.id}
                      >
                        {moment(ele.assignedDate).format("L")}
                      </td>
                      <td
                        className="border-bottom"
                        data-bs-toggle="modal"
                        data-bs-target={"#detailAssignmentModal" + ele.id}
                      >
                        {ele.state}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger border-0"
                          data-bs-toggle="modal"
                          id={"#modalAccept" + ele.id}
                          data-bs-target={"#modalAccept" + ele.id}
                          disabled={ele.state !== "Waiting for acceptance"}
                        >
                          <CheckIcon />
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-secondary border-0"
                          data-bs-toggle="modal"
                          data-bs-target={"#modalDecline" + ele.id}
                          id={"#modalDecline" + ele.id}
                          disabled={ele.state !== "Waiting for acceptance"}
                        >
                          <ClearIcon style={{ color: "#000" }} />
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-primary border-0"
                          onClick={() => setCreateReturn(ele.id)}
                          disabled={ele.state === "Waiting for acceptance"}
                        >
                          <RestartAltSharpIcon />
                        </button>
                      </td>
                    </tr>

                    <div
                      className="modal fade"
                      id={"detailAssignmentModal" + ele.id}
                      tabIndex="-1"
                      aria-labelledby="exampleModalLabel"
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content ">
                          <div className="modal-header">
                            <h5
                              className="modal-title text-danger"
                              id="exampleModalLabel"
                            >
                              Detailed Assignment Information
                            </h5>
                            <button
                              type="button"
                              className="btn btn-outline-danger border-4"
                              data-bs-dismiss="modal"
                              id="btnClose"
                            >
                              <CloseIcon />
                            </button>
                          </div>
                          <div className="modal-body">
                            <div className="detail">
                              <div className="detail-item">
                                <div className="label">Asset Code</div>
                                <div className="value">{ele.assetCode}</div>
                              </div>
                              <div className="detail-item">
                                <div className="label">Asset Name</div>
                                <div className="value">{ele.assetName}</div>
                              </div>
                              <div className="detail-item">
                                <div className="label">Specification</div>
                                <div className="value">{ele.specification}</div>
                              </div>
                              <div className="detail-item">
                                <div className="label">Assigned To</div>
                                <div className="value">{ele.assignTo}</div>
                              </div>
                              <div className="detail-item">
                                <div className="label">Assigned By</div>
                                <div className="value">{ele.assignBy}</div>
                              </div>
                              <div className="detail-item">
                                <div className="label">Assigned Date</div>
                                <div className="value">
                                  {moment(ele.assignedDate).format("L")}
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="label">State</div>
                                <div className="value">{ele.state}</div>
                              </div>
                              <div className="detail-item">
                                <div className="label">Note</div>
                                <div className="value">{ele.note}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* modal confirm acceptance */}
                    <div
                      className="modal fade"
                      tabIndex="-1"
                      role="dialog"
                      id={"modalAccept" + ele.id}
                    >
                      <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title text-danger">
                              Are you sure?
                            </h5>
                          </div>
                          <div class="modal-body">
                            <div className="text">
                              <h6>Do you want to accept this assignment?</h6>
                            </div>
                            <div className="button-group">
                              <button
                                type="button"
                                className="btn btn-danger me-4 "
                                onClick={() => handleAccept(ele.id)}
                                data-bs-dismiss="modal"
                                id="btnSave"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-dark"
                                data-bs-dismiss="modal"
                                id="btnCancel"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* modal confirm declined */}
                    <div
                      className="modal fade"
                      tabIndex="-1"
                      role="dialog"
                      id={"modalDecline" + ele.id}
                    >
                      <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title text-danger">
                              Are you sure?
                            </h5>
                          </div>
                          <div class="modal-body">
                            <div className="text">
                              <h6>Do you want to decline this assignment?</h6>
                            </div>
                            <div className="button-group">
                              <button
                                type="button"
                                className="btn btn-danger me-4"
                                onClick={() => handleDecline(ele.id)}
                                data-bs-dismiss="modal"
                                id="btnSave"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-dark"
                                data-bs-dismiss="modal"
                                id="btnCancel"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              }
            )}
          </tbody>
        </table>
        <Paging numPage={numPage} setPage={setPage} page={page} />
      </div>
      {/* end Table list */}
    </>
  );
};

export default HomePage;
