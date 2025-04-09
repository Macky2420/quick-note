import React from 'react';
import { Card, Row, Col, Space, Dropdown, FloatButton, Button } from 'antd';
import { EllipsisOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import noteIcon from '../assets/note.svg';

const data = [
  { id: 1, title: 'QuickNote Title 1' },
  { id: 2, title: 'QuickNote Title 2' },
  { id: 3, title: 'QuickNote Title 3' },
  { id: 4, title: 'QuickNote Title 4' },
];

const Home = () => {
  const handleEdit = (id) => {
    console.log('Edit note:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete note:', id);
  };

  const getMenuItems = (id) => [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEdit(id),
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(id),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
      <Card 
        title={
          <Space className="flex items-center">
            <FileTextOutlined className="text-blue-500" />
            <span className="text-lg font-semibold">My Notes</span>
          </Space>
        }
        variant={false}
        className="shadow-lg rounded-xl flex-1"
      >
        <Row gutter={[16, 16]}>
          {data.map((item) => (
            <Col
              key={item.id}
              xs={24}
              sm={12}
              md={12}
              lg={8}
            >
              <Card
                className="hover:shadow-xl transition-shadow duration-300 h-full group"
                hoverable
              >
                <div className="flex justify-between items-center"> {/* Changed to items-center */}
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={noteIcon}
                      alt="note icon"
                      className="w-12 h-12 p-2 bg-blue-50 rounded-lg"
                    />
                    <span className="font-medium text-gray-800 break-words">
                      {item.title}
                    </span>
                  </div>
                  <Dropdown 
                    menu={{ items: getMenuItems(item.id) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button 
                      type="text"
                      icon={<EllipsisOutlined className="rotate-90" />}
                      className="hover:bg-gray-100 rounded-lg ml-4" // Added margin-left
                      aria-label="Note actions"
                    />
                  </Dropdown>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Floating Action Button */}
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          tooltip="Add new note"
          onClick={() => console.log('Add new note clicked')}
          style={{
            right: 24,
            bottom: 80,
          }}
          className="fixed sm:bottom-24"
        />
      </Card>
    </div>
  );
};

export default Home;