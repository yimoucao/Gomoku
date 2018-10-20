import React from "react";

class Status extends React.Component {
  getClasses() {
    if (this.props.connectStatus === "Not Connected") {
        return "progress-bar bg-warning";
    } else if (this.props.connectStatus === "connecting") {
        return "progress-bar bg-info progress-bar-striped progress-bar-animated";
    } else if (this.props.connectStatus.includes("Failed to connect")) {
        return "progress-bar bg-danger";
    } else {
         return "progress-bar bg-success";
    }
  }

  render() {
    return (
      <div className="progress my-2" style={{ height: "3rem" }}>
        <div className={this.getClasses()} style={{ width: "100%" }}>
          <div
            className="d-flex justify-content-between p-2"
            style={{ fontSize: "1rem" }}
          >
            <div>
              Hello,{" "}
              <span className="alert-link">
                {this.props.playerName ? this.props.playerName : "visitor"}
              </span>
            </div>
            <div>
              Server{" "}
              <span
                title={this.props.connectStatus}
                role="img"
                aria-label="status"
              >
                ❔
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Status;
