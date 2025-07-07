import React, { useState } from 'react';
import Button from '../components/Button';
import '../styles/CreateUserForm.css';

interface CreateUserFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCancel, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email,
      password,
      status,
      roleDto: {
        roleId,
        roleName
      }
    };

    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('✅ User created successfully');
        if (onSuccess) onSuccess();
        onCancel(); // go back to user list
      } else {
        const err = await response.json();
        alert('❌ Failed: ' + (err.message || response.status));
      }
    } catch (error) {
      alert('❌ Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit} className="create-user-form">
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Role ID:
          <input
            type="text"
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            required
          />
        </label>

        <label>
          Role Name:
          <select
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            required
          >
            <option value="">-- Select Role --</option>
            <option value="STUDENT">Student</option>
            <option value="PARENT">Parent</option>
            <option value="ADMIN">Admin</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={status}
            onChange={e => setStatus(e.target.checked)}
          />
          Active Status
        </label>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
