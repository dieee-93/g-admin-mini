/**
 * API Inspector - Monitor HTTP calls, responses, and cache
 * Intercepts fetch and axios requests for debugging
 */

import React, { useState, useEffect } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  InputField,
  Alert,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Box
} from '@/shared/ui';

type APITab = 'requests' | 'cache' | 'errors' | 'stats';

interface APIRequest {
  id: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  timestamp: Date;
  requestData?: any;
  responseData?: any;
  error?: string;
  cached?: boolean;
}

// Global API interceptor
class APIInterceptor {
  private requests: APIRequest[] = [];
  private listeners: ((requests: APIRequest[]) => void)[] = [];
  private isSetup = false;

  setup() {
    if (this.isSetup) return;
    this.isSetup = true;

    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const id = Math.random().toString(36).substr(2, 9);
      const [url, options] = args;

      const request: APIRequest = {
        id,
        method: options?.method || 'GET',
        url: typeof url === 'string' ? url : url.toString(),
        timestamp: new Date(),
        requestData: options?.body
      };

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        request.status = response.status;
        request.duration = duration;
        request.cached = response.headers.get('cache-control') !== null;

        // Try to get response data
        try {
          const clonedResponse = response.clone();
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            request.responseData = await clonedResponse.json();
          } else if (contentType?.includes('text')) {
            request.responseData = await clonedResponse.text();
          }
        } catch {
          // Ignore response parsing errors
        }

        this.addRequest(request);
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        request.duration = duration;
        request.error = error instanceof Error ? error.message : 'Unknown error';
        this.addRequest(request);
        throw error;
      }
    };
  }

  addRequest(request: APIRequest) {
    this.requests.unshift(request);
    if (this.requests.length > 100) {
      this.requests = this.requests.slice(0, 100);
    }
    this.notifyListeners();
  }

  getRequests() {
    return [...this.requests];
  }

  clearRequests() {
    this.requests = [];
    this.notifyListeners();
  }

  subscribe(listener: (requests: APIRequest[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getRequests()));
  }
}

const apiInterceptor = new APIInterceptor();

export default function APIInspectorPage() {
  const [activeTab, setActiveTab] = useState<APITab>('requests');
  const [requests, setRequests] = useState<APIRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInterceptorActive, setIsInterceptorActive] = useState(false);

  useEffect(() => {
    const unsubscribe = apiInterceptor.subscribe(setRequests);

    // Setup interceptor
    apiInterceptor.setup();
    setIsInterceptorActive(true);

    return unsubscribe;
  }, []);

  const tabs = [
    { id: 'requests' as APITab, label: 'Requests', icon: '🌐' },
    { id: 'cache' as APITab, label: 'Cache', icon: '💾' },
    { id: 'errors' as APITab, label: 'Errors', icon: '❌' },
    { id: 'stats' as APITab, label: 'Statistics', icon: '📊' }
  ];

  const filteredRequests = requests.filter(req =>
    req.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const errorRequests = requests.filter(req => req.error || (req.status && req.status >= 400));
  const cachedRequests = requests.filter(req => req.cached);

  const getStatusColor = (status?: number) => {
    if (!status) return 'gray';
    if (status >= 200 && status < 300) return 'green';
    if (status >= 400 && status < 500) return 'red';
    if (status >= 500) return 'red';
    return 'yellow';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'blue';
      case 'POST': return 'green';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      case 'PATCH': return 'purple';
      default: return 'gray';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const averageResponseTime = requests.length > 0
    ? requests.reduce((sum, req) => sum + (req.duration || 0), 0) / requests.length
    : 0;

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🌐 API Inspector">
        <Stack spacing="md">
          {!isInterceptorActive && (
            <Alert title="API Interceptor Not Active">
              The API interceptor is not running. Requests will not be captured.
            </Alert>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <InputField
              placeholder="Search by URL or method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              style={{ maxWidth: '300px' }}
            />
            <Stack direction="row" spacing="sm">
              <Button size="sm" onClick={() => apiInterceptor.clearRequests()}>
                🗑️ Clear ({requests.length})
              </Button>
              <Badge colorPalette="blue">
                {requests.length} requests captured
              </Badge>
            </Stack>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as APITab)}
            variant="line"
            colorPalette="blue"
          >
            <TabList>
              {tabs.map(tab => (
                <Tab
                  key={tab.id}
                  value={tab.id}
                  icon={<span>{tab.icon}</span>}
                >
                  {tab.label}
                  {tab.id === 'errors' && errorRequests.length > 0 && (
                    <Badge colorPalette="red" size="sm" style={{ marginLeft: '4px' }}>
                      {errorRequests.length}
                    </Badge>
                  )}
                </Tab>
              ))}
            </TabList>

            <div style={{ marginTop: '20px' }}>
              <TabPanel value="requests" padding="md">
                <Stack spacing="sm">
                  <Typography variant="h6">HTTP Requests ({filteredRequests.length})</Typography>

                  {filteredRequests.map(request => (
                    <Card key={request.id} variant="elevated">
                      <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing="sm" align="center">
                            <Badge colorPalette={getMethodColor(request.method)} size="sm">
                              {request.method}
                            </Badge>
                            {request.status && (
                              <Badge colorPalette={getStatusColor(request.status)} size="sm">
                                {request.status}
                              </Badge>
                            )}
                            <Typography variant="body" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                              {request.url}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing="xs" align="center">
                            <Badge colorPalette="gray" size="sm">
                              {formatDuration(request.duration)}
                            </Badge>
                            {request.cached && (
                              <Badge colorPalette="green" size="sm">CACHED</Badge>
                            )}
                            <Typography variant="body" style={{ fontSize: '10px', color: '#666' }}>
                              {request.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Stack>
                        </div>
                      </CardHeader>

                      {(request.requestData || request.responseData || request.error) && (
                        <CardBody>
                          {request.error && (
                            <div style={{ marginBottom: '12px' }}>
                              <Typography variant="body" style={{ color: 'red', fontSize: '12px' }}>
                                <strong>Error:</strong> {request.error}
                              </Typography>
                            </div>
                          )}

                          {request.requestData && (
                            <div style={{ marginBottom: '12px' }}>
                              <Typography variant="body" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                                Request Data:
                              </Typography>
                              <Box
                                as="pre"
                                bg="gray.100"
                                p="2"
                                borderRadius="sm"
                                fontSize="2xs"
                                fontFamily="mono"
                                overflow="auto"
                                maxHeight="150px"
                                whiteSpace="pre-wrap"
                                wordBreak="break-word"
                              >
                                {typeof request.requestData === 'string'
                                  ? request.requestData
                                  : JSON.stringify(request.requestData, null, 2)}
                              </Box>
                            </div>
                          )}

                          {request.responseData && (
                            <div>
                              <Typography variant="body" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                                Response Data:
                              </Typography>
                              <Box
                                as="pre"
                                bg="blue.50"
                                p="2"
                                borderRadius="sm"
                                fontSize="2xs"
                                fontFamily="mono"
                                overflow="auto"
                                maxHeight="150px"
                                whiteSpace="pre-wrap"
                                wordBreak="break-word"
                                borderLeft="3px solid"
                                borderColor="blue.200"
                              >
                                {typeof request.responseData === 'string'
                                  ? request.responseData
                                  : JSON.stringify(request.responseData, null, 2)}
                              </Box>
                            </div>
                          )}
                        </CardBody>
                      )}
                    </Card>
                  ))}

                  {filteredRequests.length === 0 && (
                    <Card variant="elevated">
                      <CardBody>
                        <Typography variant="body" style={{ textAlign: 'center', color: '#666' }}>
                          No requests found. Make some API calls to see them here.
                        </Typography>
                      </CardBody>
                    </Card>
                  )}
                </Stack>
              </TabPanel>

              <TabPanel value="cache" padding="md">
                <Stack spacing="sm">
                  <Typography variant="h6">Cached Requests ({cachedRequests.length})</Typography>

                  {cachedRequests.map(request => (
                    <Card key={request.id} variant="elevated">
                      <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing="sm" align="center">
                            <Badge colorPalette={getMethodColor(request.method)} size="sm">
                              {request.method}
                            </Badge>
                            <Badge colorPalette="green" size="sm">CACHED</Badge>
                            <Typography variant="body" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                              {request.url}
                            </Typography>
                          </Stack>
                          <Typography variant="body" style={{ fontSize: '10px', color: '#666' }}>
                            {request.timestamp.toLocaleTimeString()}
                          </Typography>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}

                  {cachedRequests.length === 0 && (
                    <Card variant="elevated">
                      <CardBody>
                        <Typography variant="body" style={{ textAlign: 'center', color: '#666' }}>
                          No cached requests found.
                        </Typography>
                      </CardBody>
                    </Card>
                  )}
                </Stack>
              </TabPanel>

              <TabPanel value="errors" padding="md">
                <Stack spacing="sm">
                  <Typography variant="h6">Failed Requests ({errorRequests.length})</Typography>

                  {errorRequests.map(request => (
                    <Card key={request.id} variant="elevated" style={{ borderLeft: '4px solid #ef4444' }}>
                      <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing="sm" align="center">
                            <Badge colorPalette={getMethodColor(request.method)} size="sm">
                              {request.method}
                            </Badge>
                            <Badge colorPalette="red" size="sm">
                              {request.status || 'ERROR'}
                            </Badge>
                            <Typography variant="body" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                              {request.url}
                            </Typography>
                          </Stack>
                          <Typography variant="body" style={{ fontSize: '10px', color: '#666' }}>
                            {request.timestamp.toLocaleTimeString()}
                          </Typography>
                        </div>
                      </CardHeader>
                      {request.error && (
                        <CardBody>
                          <Typography variant="body" style={{ color: '#ef4444', fontSize: '12px' }}>
                            {request.error}
                          </Typography>
                        </CardBody>
                      )}
                    </Card>
                  ))}

                  {errorRequests.length === 0 && (
                    <Card variant="elevated">
                      <CardBody>
                        <Typography variant="body" style={{ textAlign: 'center', color: '#666' }}>
                          No failed requests. Great job! 🎉
                        </Typography>
                      </CardBody>
                    </Card>
                  )}
                </Stack>
              </TabPanel>

              <TabPanel value="stats" padding="md">
                <Stack spacing="md">
                  <Typography variant="h6">Request Statistics</Typography>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <Card variant="elevated">
                      <CardBody style={{ textAlign: 'center' }}>
                        <Typography variant="h4" style={{ color: '#3b82f6', margin: '0 0 4px 0' }}>
                          {requests.length}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          Total Requests
                        </Typography>
                      </CardBody>
                    </Card>

                    <Card variant="elevated">
                      <CardBody style={{ textAlign: 'center' }}>
                        <Typography variant="h4" style={{ color: '#22c55e', margin: '0 0 4px 0' }}>
                          {requests.filter(r => r.status && r.status >= 200 && r.status < 300).length}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          Successful
                        </Typography>
                      </CardBody>
                    </Card>

                    <Card variant="elevated">
                      <CardBody style={{ textAlign: 'center' }}>
                        <Typography variant="h4" style={{ color: '#ef4444', margin: '0 0 4px 0' }}>
                          {errorRequests.length}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          Failed
                        </Typography>
                      </CardBody>
                    </Card>

                    <Card variant="elevated">
                      <CardBody style={{ textAlign: 'center' }}>
                        <Typography variant="h4" style={{ color: '#f97316', margin: '0 0 4px 0' }}>
                          {formatDuration(averageResponseTime)}
                        </Typography>
                        <Typography variant="body" style={{ fontSize: '12px', color: '#666' }}>
                          Avg Response Time
                        </Typography>
                      </CardBody>
                    </Card>
                  </div>
                </Stack>
              </TabPanel>
            </div>
          </Tabs>
        </Stack>
      </Section>
    </ContentLayout>
  );
}