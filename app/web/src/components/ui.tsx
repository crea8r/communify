export const Button = (props: any) => {
  let clsN =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2';
  clsN += props.className ? ` ${props.className}` : '';
  return (
    <>
      {props.disabled ? (
        <div className={`${clsN} bg-gray-500 select-none`}>
          {props.children}
        </div>
      ) : (
        <button className={clsN} onClick={props.onClick}>
          {props.children}
        </button>
      )}
    </>
  );
};

export const Card = (props: any) => {
  return (
    <div
      className={`rounded-lg border bg-white color-black shadow-sm ${props.className}`}
    >
      {props.children}
    </div>
  );
};

export const CardTitle = (props: any) => {
  return (
    <h3 className='whitespace-nowrap text-2xl font-semibold leading-none tracking-tight'>
      {props.children}
    </h3>
  );
};

export const CardDescription = (props: any) => {
  return <p className='text-sm text-gray-500'>{props.children}</p>;
};

export const CardHeader = (props: any) => {
  // eslint-disable-next-line react/prop-types
  return <div className='flex flex-col space-y-1.5 p-6'>{props.children}</div>;
};

export const CardContent = (props: any) => {
  return <div className={`p-6 ${props.className || ''}`}>{props.children}</div>;
};

export const Label = (props: any) => {
  return (
    <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
      {props.children}
    </label>
  );
};
export const Input = (props: any) => {
  return (
    <input
      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white'
      onChange={props.onChange}
      value={props.value}
      disabled={props.disabled}
    >
      {props.children}
    </input>
  );
};

export const ActivityIcon = (props: any) => {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2' />
    </svg>
  );
};

export const MountainIcon = (props: any) => {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='m8 3 4 8 5-5 5 15H2L8 3z' />
    </svg>
  );
};

export const UsersIcon = (props: any) => {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
      <circle cx='9' cy='7' r='4' />
      <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
      <path d='M16 3.13a4 4 0 0 1 0 7.75' />
    </svg>
  );
};

export const WalletIcon = (props: any) => {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1' />
      <path d='M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' />
    </svg>
  );
};
