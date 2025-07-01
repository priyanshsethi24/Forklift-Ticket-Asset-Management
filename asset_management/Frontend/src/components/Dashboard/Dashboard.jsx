import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import TicketSummary from './TicketSummary';
import RecentActivity from './RecentActivity';
import TodoList from './TodoList';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="dashboard-tabs">
          <button className="tab active">DASHBOARD 1</button>
          <button className="tab">DASHBOARD 2</button>
          <button className="tab">DASHBOARD 3</button>
        </div>

        <div className="ticket-summary-grid">
          <TicketSummary title="Overdue" count={0} />
          <TicketSummary title="Open" count={12} />
          <TicketSummary title="On Hold" count={23} />
          <TicketSummary title="Due Today" count={5} />
          <TicketSummary title="Unassigned" count={8} />
        </div>

        <div className="dashboard-bottom">
          <RecentActivity />
          <TodoList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 