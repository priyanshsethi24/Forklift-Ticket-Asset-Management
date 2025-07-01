import React from 'react';

const TicketCard = () => {
  // Example static ticket data (replace with dynamic data later)
  const tickets = [
    { id: 'T001', title: 'Forklift Repair', status: 'New' },
    { id: 'T002', title: 'Tire Replacement', status: 'In Progress' },
    { id: 'T003', title: 'Battery Checkup', status: 'Resolved' },
    { id: 'T004', title: 'Engine Maintenance', status: 'Escalated' },
  ];

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.title}</td>
              <td>
                <span className={`badge bg-${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Function to determine badge color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'New':
      return 'primary';
    case 'In Progress':
      return 'warning';
    case 'Resolved':
      return 'success';
    case 'Escalated':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default TicketCard;
