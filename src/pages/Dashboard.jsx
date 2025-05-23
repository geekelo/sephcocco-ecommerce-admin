import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';
import ChatItem from '../components/ChatItem';
import ProductCard from '../components/ProductCard';
import { paymentsData, performanceData, topSellingProducts, unresolvedChats } from '../constants/data';
import '../styles/Dashboard.css'

const DashboardPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductEdit = (product) => {
    console.log('Edit product:', product);
  };

  const handleProductDelete = (product) => {
    console.log('Delete product:', product);
  };

  const handleProductView = (product) => {
    console.log('View product:', product);
  };

  const handleChatReply = (chat) => {
    console.log('Reply to chat:', chat);
  };

  // Custom bar shape for the chart
  const CustomBar = (props) => {
    const { fill, ...rest } = props;
    return <Bar {...rest} fill={rest.payload?.name === 'Aug' ? '#FF6B35' : '#FFE5E0'} />;
  };

  return (
    <div className="dashboard">
      {/* Top Stats Row */}
      <div className="stats-row">
        <StatsCard
          title="Total Orders"
          value="22000"
          trend={
            <div className="trend-chart">
              <ResponsiveContainer width={100} height={50}>
                <BarChart data={[
                  { value: 25, name: 'bar1' }, 
                  { value: 45, name: 'bar2' }, 
                  { value: 15, name: 'bar3' }, 
                  { value: 35, name: 'bar4' }, 
                  { value: 20, name: 'bar5' }
                ]}>
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    <Cell fill="#FFE5E0" />
                    <Cell fill="#FF6B35" />
                    <Cell fill="#FFE5E0" />
                    <Cell fill="#FFE5E0" />
                    <Cell fill="#FFE5E0" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        />
        
        <StatsCard
          title="Total Payments"
          value="$6000"
          trend={
            <div className="payment-trend">
              <ResponsiveContainer width={100} height={50}>
                <LineChart data={paymentsData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FF6B35" 
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="none"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="big-circle-container">
                <div className="large-circle">
                  <div className="dash-line"></div>
                  <div className="center-dot"></div>
                </div>
              </div>
            </div>
          }
        />
        
        <StatsCard
          title="Unresolved Chats"
          value="15"
          isOrange={true}
          icon={
            <div className="pie-chart-container">
              <div className="circular-progress">
                <div className="progress-ring">
                  <div className="progress-arc"></div>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* Main Content Row */}
      <div className="main-content">
        {/* Performance Chart */}
        <div className="chart-section">
          <div className="section-header">
            <h2>Overall Performance</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Aug' ? '#FF6B35' : '#FFE5E0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unresolved Chats Sidebar */}
        <div className="chat-sidebar">
          <div className="section-header">
            <h3>Unresolved Chats</h3>
            <span className="see-all">See all</span>
          </div>
          <div className="chat-list">
            {unresolvedChats.map(chat => (
              <ChatItem key={chat.id} chat={chat} onReply={handleChatReply} />
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="products-section">
        <div className="section-header">
          <h2>Top selling Products</h2>
        </div>
        <div className="products-grid">
          {topSellingProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleProductEdit}
              onDelete={handleProductDelete}
              onView={handleProductView}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;