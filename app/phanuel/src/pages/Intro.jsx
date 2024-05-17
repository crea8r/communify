const Intro = () => {
  return (
    <div className='p-4 bg-white rounded-lg'>
      <p className='font-bold'>Intro</p>
      <div className='my-2'>
        <p>A token represent the bloodline of the community.</p>
        <p>
          Each token will decay, only increasing in lifetime if sent to others.
          This is an anti-hoarding token.
        </p>
      </div>
      <div className='font-bold'>Usecases (Mockup only):</div>
      <div>
        -{' '}
        <a className='underline' href='/create-token' target='_blank'>
          Create token
        </a>
        : Name & Decay time
      </div>
      <div>
        -{' '}
        <a className='underline' href='/manage-token' target='_blank'>
          Manage community
        </a>
        : Add / Remove Members; Mint Token to members
      </div>
      <div>
        -{' '}
        <a className='underline' href='/wallet' target='_blank'>
          View & Transfer
        </a>{' '}
        tokens to other community members
      </div>
      <div className='my-2'>
        <div>
          Read the full{' '}
          <a
            href='https://hieub.notion.site/phanuel-Help-Token-aca5e5ecd74c47ff8091456067414bae?pvs=4/'
            target='_blank'
          >
            explanation
          </a>{' '}
          here or community deck{' '}
          <a
            href='https://www.canva.com/design/DAGFfJ1e5BM/Qzp5bOZ8Ie6pamL-A8dF3Q/edit?utm_content=DAGFfJ1e5BM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton'
            target='_blank'
          >
            here
          </a>
        </div>
      </div>
      <div className='my-2'>
        Program Address (and idl):{' '}
        <a
          className='underline'
          href='https://solscan.io/account/Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok?cluster=devnet#anchorProgramIdl'
          target='_blank'
        >
          Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok
        </a>
      </div>
    </div>
  );
};

export default Intro;
